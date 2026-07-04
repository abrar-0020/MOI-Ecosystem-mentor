'use strict';

const { embed } = require('./embedder');
const { search } = require('./vectorStore');

// =====================================================
// RAG Retriever
//
// Given a user question:
//  1. Detects if user explicitly asked for a session filter
//  2. Computes dynamic top-K based on question characteristics
//  3. Embeds the query with nomic-embed-text
//  4. Searches LanceDB for most similar chunks
//  5. Returns chunks + sources for the prompt builder
// =====================================================

// -----------------------------------------------
// Dynamic Top-K: calibrated to question complexity
// -----------------------------------------------

const DEBUG_KEYWORDS = [
    'error', 'fix', 'problem', 'issue', 'not working',
    'failed', 'crash', 'exception', 'broken', 'wrong',
    'cannot', "can't", 'unable', 'stuck', 'help'
];

/**
 * Computes the number of chunks to retrieve based on question type.
 *
 * @param {string} query - User question
 * @returns {number} Top-K value (3, 5, or 8)
 */
function computeTopK(query) {
    const lower = query.toLowerCase();
    const wordCount = query.trim().split(/\s+/).length;

    const isDebugging = DEBUG_KEYWORDS.some(kw => lower.includes(kw));
    if (isDebugging) return 8;   // Debugging needs more context

    if (wordCount < 15) return 3; // Short/simple question
    return 5;                     // Default for detailed questions
}

// -----------------------------------------------
// Session Filter: ONLY when user explicitly asks
// -----------------------------------------------

const SESSION_EXPLICIT_PATTERNS = [
    /\bonly\s+(?:in\s+|from\s+)?session[\s\-_]?(\d)\b/i,
    /\bsession[\s\-_]?(\d)\s+only\b/i,
    /\bjust\s+session[\s\-_]?(\d)\b/i,
    /\bspecifically\s+(?:in\s+|from\s+)?session[\s\-_]?(\d)\b/i,
    /\bfrom\s+session[\s\-_]?(\d)\s+only\b/i
];

/**
 * Detects if the user explicitly requested a session-scoped search.
 * Returns null if no explicit request — we always search everything by default.
 *
 * Examples that trigger filter:
 *   "only session 3" → 'session-3'
 *   "session 2 only" → 'session-2'
 *   "just session 1" → 'session-1'
 *
 * Examples that do NOT trigger filter:
 *   "tell me about session 3"  → null (just a mention)
 *   "session 2 OpenClaw"       → null
 *
 * @param {string} query
 * @returns {string|null} e.g. 'session-3' or null
 */
function detectSessionFilter(query) {
    for (const pattern of SESSION_EXPLICIT_PATTERNS) {
        const match = query.match(pattern);
        if (match) {
            return `session-${match[1]}`;
        }
    }
    return null;
}

/**
 * Deduplicates retrieved chunks by source+heading.
 * Prevents the same section from appearing multiple times.
 *
 * @param {Array<object>} chunks
 * @returns {Array<object>}
 */
function deduplicateChunks(chunks) {
    const seen = new Set();
    return chunks.filter(chunk => {
        const key = `${chunk.source}::${chunk.heading}::${chunk.chunk_index}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Main retrieval function.
 *
 * @param {string} query - Raw user question
 * @returns {Promise<{
 *   chunks: Array<object>,
 *   sources: Array<{file: string, heading: string, session: string}>,
 *   topK: number,
 *   sessionFilter: string|null
 * }>}
 */
async function retrieve(query) {
    // 1. Compute top-K
    const topK = computeTopK(query);

    // 2. Detect explicit session filter
    const sessionFilter = detectSessionFilter(query);

    // 3. Embed the query
    let queryVector;
    try {
        queryVector = await embed(query);
    } catch (err) {
        throw new Error(`Embedding failed: ${err.message}`);
    }

    // 4. Search vector store
    const rawResults = await search(queryVector, {
        limit: topK,
        sessionFilter
    });

    // 5. Deduplicate
    const chunks = deduplicateChunks(rawResults);

    // 6. Build clean sources list for citation
    const sources = chunks.map(chunk => ({
        file: chunk.source,
        heading: chunk.heading || '',
        session: chunk.session || 'root'
    }));

    return {
        chunks,
        sources,
        topK,
        sessionFilter
    };
}

module.exports = { retrieve, computeTopK, detectSessionFilter };
