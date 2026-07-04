'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { glob } = require('glob');

const { splitDocument } = require('./splitter');
const { embedBatch } = require('./embedder');
const { upsertChunks, deleteChunks, getStats, connect } = require('./vectorStore');

// =====================================================
// Document Ingestion Pipeline
//
// Usage:  node rag/ingest.js
//      or npm run ingest
//
// What it does:
//   1. Scans knowledge/ recursively for supported files
//   2. Hashes each file (SHA-256)
//   3. Compares hash against stored manifest
//   4. Skips unchanged files (no re-embedding)
//   5. Removes chunks for deleted/modified files
//   6. Chunks → embeds → upserts new/changed files
//   7. Updates manifest
//
// Supported extensions: .md .txt .js .mjs .json .sh .env.example
// =====================================================

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge');
const LANCEDB_DIR = path.join(__dirname, '..', 'lancedb');
const MANIFEST_PATH = path.join(LANCEDB_DIR, '.manifest.json');

const SUPPORTED_EXTENSIONS = ['.md', '.txt', '.js', '.mjs', '.json', '.sh'];
const IGNORED_PATTERNS = ['node_modules/**', '*.lock', '.git/**'];

// Chunk configuration
const CHUNK_SIZE = 300;   // tokens
const CHUNK_OVERLAP = 40; // tokens

// =====================================================
// Manifest: tracks file hash → chunk_ids per source
// Format: { "session-1/deploy.js": { hash: "abc...", chunks: 5 } }
// =====================================================

function loadManifest() {
    try {
        if (fs.existsSync(MANIFEST_PATH)) {
            return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
        }
    } catch {
        // Corrupt manifest — start fresh
    }
    return {};
}

function saveManifest(manifest) {
    fs.mkdirSync(LANCEDB_DIR, { recursive: true });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
}

/**
 * Computes SHA-256 hash of a file's content.
 */
function hashFile(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Derives a session label from the file path.
 * Files directly in knowledge/ → 'root'
 * Files in knowledge/session-1/ → 'session-1'
 * Files in knowledge/session-2/subfolder/ → 'session-2'
 */
function deriveSession(relativePath) {
    const parts = relativePath.split('/');
    if (parts.length === 1) return 'root';

    const folder = parts[0].toLowerCase();
    // Normalize variants: session_1, session1, session-1 → session-1
    const match = folder.match(/session[_\-\s]?(\d+)/);
    if (match) return `session-${match[1]}`;

    return folder;
}

/**
 * Derives the file's primary title.
 * Uses the first H1 heading if found in Markdown, otherwise the filename.
 */
function deriveTitle(text, filename) {
    const h1Match = text.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();
    return path.basename(filename, path.extname(filename));
}

/**
 * Processes a single file into chunks ready for embedding.
 *
 * @param {string} absolutePath - Full filesystem path
 * @param {string} relativePath - Path relative to knowledge/ dir
 * @returns {Array<object>} Array of chunk objects (without vector yet)
 */
function chunkFile(absolutePath, relativePath) {
    const content = fs.readFileSync(absolutePath, 'utf8');
    const ext = path.extname(absolutePath).toLowerCase().replace('.', '');
    const filename = path.basename(absolutePath);
    const session = deriveSession(relativePath);
    const title = deriveTitle(content, filename);
    const lastModified = fs.statSync(absolutePath).mtime.toISOString();

    const splits = splitDocument(content, {
        chunkSize: CHUNK_SIZE,
        overlap: CHUNK_OVERLAP,
        fileType: ext
    });

    return splits.map((split, index) => ({
        id: `${relativePath.replace(/[^a-zA-Z0-9]/g, '_')}_chunk_${index}`,
        text: split.text,
        source: relativePath,
        filename,
        session,
        heading: split.heading || '',
        language: ext,
        title,
        last_modified: lastModified,
        chunk_index: index
        // vector will be added after embedding
    }));
}

/**
 * Main ingestion pipeline.
 */
async function ingest() {
    console.log('\n🔍 MOI RAG — Document Ingestion Pipeline');
    console.log('==========================================\n');

    // -----------------------------------------------
    // 1. Ensure knowledge directory exists
    // -----------------------------------------------
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
        console.error(`❌ knowledge/ directory not found at: ${KNOWLEDGE_DIR}`);
        process.exit(1);
    }

    // -----------------------------------------------
    // 2. Scan all supported files
    // -----------------------------------------------
    const globPattern = `**/*{${SUPPORTED_EXTENSIONS.join(',')}}`;
    const absolutePaths = await glob(globPattern, {
        cwd: KNOWLEDGE_DIR,
        absolute: true,
        ignore: IGNORED_PATTERNS
    });

    if (absolutePaths.length === 0) {
        console.warn('⚠️  No supported files found in knowledge/');
        console.warn(`   Add .md, .txt, .js, .mjs, .json, or .sh files and re-run.`);
        return;
    }

    console.log(`📁 Found ${absolutePaths.length} files in knowledge/\n`);

    // -----------------------------------------------
    // 3. Load existing manifest
    // -----------------------------------------------
    const manifest = loadManifest();

    // -----------------------------------------------
    // 4. Compute hashes and categorize files
    // -----------------------------------------------
    const currentRelativePaths = new Set();
    const filesToProcess = [];      // new or changed files
    const filesSkipped = [];        // unchanged files

    for (const absolutePath of absolutePaths) {
        const relativePath = path.relative(KNOWLEDGE_DIR, absolutePath).replace(/\\/g, '/');
        currentRelativePaths.add(relativePath);

        const hash = hashFile(absolutePath);
        const existing = manifest[relativePath];

        if (existing && existing.hash === hash) {
            filesSkipped.push(relativePath);
        } else {
            filesToProcess.push({ absolutePath, relativePath, hash });
        }
    }

    // -----------------------------------------------
    // 5. Detect deleted files (in manifest but not on disk)
    // -----------------------------------------------
    const deletedSources = Object.keys(manifest).filter(
        src => !currentRelativePaths.has(src)
    );

    // -----------------------------------------------
    // 6. Report plan
    // -----------------------------------------------
    console.log(`📊 Ingestion Plan:`);
    console.log(`   ✅ ${filesSkipped.length} unchanged (will skip)`);
    console.log(`   🔄 ${filesToProcess.length} new/changed (will process)`);
    console.log(`   🗑️  ${deletedSources.length} deleted (will remove)\n`);

    if (filesToProcess.length === 0 && deletedSources.length === 0) {
        console.log('✨ Everything is up to date. Nothing to do.\n');
        const stats = await getStats();
        console.log(`📦 Total chunks indexed: ${stats.count}`);
        return;
    }

    // -----------------------------------------------
    // 7. Connect to vector store
    // -----------------------------------------------
    await connect();

    // -----------------------------------------------
    // 8. Remove deleted file chunks
    // -----------------------------------------------
    if (deletedSources.length > 0) {
        console.log(`🗑️  Removing chunks for ${deletedSources.length} deleted file(s)...`);
        await deleteChunks(deletedSources);

        for (const src of deletedSources) {
            delete manifest[src];
        }
    }

    // -----------------------------------------------
    // 9. Process changed/new files
    // -----------------------------------------------
    if (filesToProcess.length > 0) {
        console.log(`⚙️  Processing ${filesToProcess.length} file(s)...\n`);

        let totalChunks = 0;

        for (const { absolutePath, relativePath, hash } of filesToProcess) {
            const shortPath = relativePath;
            process.stdout.write(`   📄 ${shortPath} ... `);

            try {
                // Chunk the file
                const chunks = chunkFile(absolutePath, relativePath);

                if (chunks.length === 0) {
                    console.log('⚠️  empty after chunking, skipped');
                    continue;
                }

                // Embed all chunk texts
                const texts = chunks.map(c => c.text);
                const vectors = await embedBatch(texts, {
                    batchSize: 4,
                    delayMs: 50
                });

                // Attach vectors to chunks
                const records = chunks.map((chunk, i) => ({
                    ...chunk,
                    vector: vectors[i]
                }));

                // Upsert into LanceDB
                await upsertChunks(records);

                // Update manifest
                manifest[relativePath] = { hash, chunks: chunks.length };
                totalChunks += chunks.length;

                console.log(`✅ ${chunks.length} chunks`);

            } catch (err) {
                console.log(`❌ ERROR: ${err.message}`);
            }
        }

        console.log(`\n📦 ${totalChunks} chunks ingested from ${filesToProcess.length} file(s)`);
    }

    // -----------------------------------------------
    // 10. Save updated manifest
    // -----------------------------------------------
    saveManifest(manifest);

    // -----------------------------------------------
    // 11. Final report
    // -----------------------------------------------
    const stats = await getStats();
    console.log(`\n🎉 Done! Total chunks in vector store: ${stats.count}`);
    console.log(`📋 Manifest saved to: lancedb/.manifest.json\n`);
}

// Run
ingest().catch(err => {
    console.error('\n❌ Ingestion failed:', err.message);
    console.error(err.stack);
    process.exit(1);
});
