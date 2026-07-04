'use strict';

const { Ollama } = require('ollama');

// =====================================================
// Embedding Engine
// Model: nomic-embed-text (via local Ollama)
// Output: 768-dimensional float vector per text
//
// Pull model once with: ollama pull nomic-embed-text
// =====================================================

const EMBED_MODEL = process.env.EMBED_MODEL || 'nomic-embed-text';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

const ollama = new Ollama({ host: OLLAMA_HOST });

/**
 * Embed a single text string.
 * Returns a 768-dimensional number array.
 *
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function embed(text) {
    if (!text || text.trim().length === 0) {
        throw new Error('embed() received empty text');
    }

    // Safety truncate — nomic-embed-text supports up to 8192 tokens
    // ~4 chars/token → 8192 * 4 = 32768 chars
    const truncated = text.substring(0, 32000);

    const res = await ollama.embeddings({
        model: EMBED_MODEL,
        prompt: truncated
    });

    if (!res.embedding || !Array.isArray(res.embedding)) {
        throw new Error(`Invalid embedding response from Ollama for model ${EMBED_MODEL}`);
    }

    return res.embedding;
}

/**
 * Embed an array of texts in batches.
 * Prevents overwhelming the Ollama server.
 *
 * @param {string[]} texts
 * @param {object}   options
 * @param {number}   options.batchSize  - Texts per parallel batch (default: 4)
 * @param {number}   options.delayMs    - Delay between batches in ms (default: 50)
 * @param {function} options.onProgress - Optional callback(done, total)
 * @returns {Promise<number[][]>}
 */
async function embedBatch(texts, options = {}) {
    const {
        batchSize = 4,
        delayMs = 50,
        onProgress = null
    } = options;

    const vectors = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchVectors = await Promise.all(batch.map(t => embed(t)));
        vectors.push(...batchVectors);

        if (onProgress) {
            onProgress(Math.min(i + batchSize, texts.length), texts.length);
        }

        // Brief pause between batches to avoid Ollama rate limits
        if (i + batchSize < texts.length && delayMs > 0) {
            await new Promise(r => setTimeout(r, delayMs));
        }
    }

    return vectors;
}

module.exports = { embed, embedBatch, EMBED_MODEL };
