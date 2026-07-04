'use strict';

const path = require('path');

// =====================================================
// LanceDB Vector Store Wrapper
//
// Persists to: ./lancedb/ (Apache Arrow files on disk)
// Table name: moi_knowledge
// Schema:
//   id            - unique chunk identifier
//   text          - chunk content
//   vector        - 768-dim embedding (nomic-embed-text)
//   source        - relative path from knowledge/ dir
//   filename      - base filename
//   session       - 'session-1', 'session-2', etc. or 'root'
//   heading       - nearest Markdown heading above the chunk
//   language      - file extension ('md', 'js', 'txt', etc.)
//   title         - first heading or filename
//   last_modified - ISO timestamp of file modification
//   chunk_index   - position of chunk within its source file
// =====================================================

const DB_PATH = path.join(__dirname, '..', 'lancedb');
const TABLE_NAME = 'moi_knowledge';

let db = null;
let table = null;
let lancedb = null;

/**
 * Lazy-loads the LanceDB module and connects to the database.
 * @returns {Promise<object>} LanceDB database instance
 */
async function connect() {
    if (db) return db;

    if (!lancedb) {
        try {
            lancedb = require('@lancedb/lancedb');
        } catch (e) {
            throw new Error(
                'LanceDB not installed. Run: npm install @lancedb/lancedb\n' + e.message
            );
        }
    }

    db = await lancedb.connect(DB_PATH);
    return db;
}

/**
 * Opens existing table or returns null if it doesn't exist.
 * @returns {Promise<object|null>}
 */
async function getTable() {
    if (table) return table;

    const database = await connect();
    const names = await database.tableNames();

    if (names.includes(TABLE_NAME)) {
        table = await database.openTable(TABLE_NAME);
    }

    return table;
}

/**
 * Creates the table from scratch (overwrites if exists).
 * Used during first ingestion.
 *
 * @param {Array<object>} records - Array of chunk records with 'vector' field
 * @returns {Promise<object>} LanceDB table
 */
async function createTable(records) {
    const database = await connect();
    table = await database.createTable(TABLE_NAME, records, { mode: 'overwrite' });
    return table;
}

/**
 * Upserts chunks into the vector store.
 * - Deletes existing chunks from the same source file
 * - Inserts the new chunks
 *
 * This makes ingestion idempotent for changed files.
 *
 * @param {Array<object>} chunks - Chunk records with 'vector' field
 */
async function upsertChunks(chunks) {
    if (!chunks || chunks.length === 0) return;

    const existingTable = await getTable();

    if (!existingTable) {
        // First ever ingestion — create the table
        await createTable(chunks);
        return;
    }

    // Delete stale chunks for the same source files
    const uniqueSources = [...new Set(chunks.map(c => c.source))];

    for (const src of uniqueSources) {
        try {
            // Escape single quotes in path for SQL-like filter
            const escapedSrc = src.replace(/'/g, "''");
            await table.delete(`source = '${escapedSrc}'`);
        } catch {
            // Table might be empty — ignore delete errors
        }
    }

    // Insert new chunks
    await table.add(chunks);
}

/**
 * Deletes all chunks belonging to source files that no longer exist.
 *
 * @param {string[]} deletedSources - Relative source paths to remove
 */
async function deleteChunks(deletedSources) {
    if (!deletedSources || deletedSources.length === 0) return;

    const t = await getTable();
    if (!t) return;

    for (const src of deletedSources) {
        try {
            const escaped = src.replace(/'/g, "''");
            await t.delete(`source = '${escaped}'`);
        } catch {
            // Ignore — chunk may already be absent
        }
    }
}

/**
 * Performs a vector similarity search.
 *
 * @param {number[]} queryVector   - 768-dim query embedding
 * @param {object}   options
 * @param {number}   options.limit - Number of results (default: 5)
 * @param {string}   options.sessionFilter - Optional session to filter by (e.g. 'session-3')
 * @returns {Promise<Array<object>>} Matching chunk records with _distance field
 */
async function search(queryVector, options = {}) {
    const { limit = 5, sessionFilter = null } = options;

    const t = await getTable();
    if (!t) return [];

    let query = t.search(queryVector).limit(limit);

    if (sessionFilter) {
        // Only apply when user explicitly requested a session filter
        query = query.where(`session = '${sessionFilter}'`);
    }

    try {
        return await query.toArray();
    } catch (err) {
        console.error('[vectorStore] Search error:', err.message);
        return [];
    }
}

/**
 * Returns the total number of indexed chunks.
 * @returns {Promise<{ count: number }>}
 */
async function getStats() {
    const t = await getTable();
    if (!t) return { count: 0 };

    try {
        const count = await t.countRows();
        return { count };
    } catch {
        return { count: 0 };
    }
}

/**
 * Resets the connection (useful for testing).
 */
function reset() {
    db = null;
    table = null;
}

module.exports = {
    connect,
    getTable,
    createTable,
    upsertChunks,
    deleteChunks,
    search,
    getStats,
    reset
};
