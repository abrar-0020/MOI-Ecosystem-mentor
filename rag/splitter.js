'use strict';

// =====================================================
// Recursive Character Text Splitter
// Based on the industry-standard algorithm used by
// LangChain, LlamaIndex, etc.
//
// Strategy:
//  1. Try to split at Markdown headings (##, ###)
//  2. Fall back to paragraph breaks (\n\n)
//  3. Then line breaks (\n)
//  4. Then word boundaries
//  5. Finally character-level (last resort)
//
// For .js/.mjs files: prefer code-aware separators first.
// =====================================================

const MARKDOWN_SEPARATORS = [
    '\n## ',
    '\n### ',
    '\n#### ',
    '\n\n',
    '\n',
    ' ',
    ''
];

const CODE_SEPARATORS = [
    '\nfunction ',
    '\nconst ',
    '\nlet ',
    '\nvar ',
    '\nasync function ',
    '\nexport ',
    '\nmodule.exports',
    '\n\n',
    '\n',
    ' ',
    ''
];

/**
 * Estimates token count from character length.
 * Approximation: 1 token ≈ 4 characters (English prose).
 */
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

/**
 * Core recursive splitter.
 * Tries each separator in order, splitting until chunks fit within chunkSize.
 */
function splitRecursive(text, separators, chunkSize, overlap) {
    const results = [];

    // Find the first separator that actually appears in the text
    let activeSep = '';
    let remainingSeps = [];

    for (let i = 0; i < separators.length; i++) {
        const sep = separators[i];
        if (sep === '' || text.includes(sep)) {
            activeSep = sep;
            remainingSeps = separators.slice(i + 1);
            break;
        }
    }

    // Split text using the active separator
    const splits = activeSep === ''
        ? text.split('')
        : text.split(activeSep);

    let currentChunk = '';

    for (let i = 0; i < splits.length; i++) {
        const piece = splits[i];

        // Reconstruct the separator that was stripped
        const withSep = i === 0 ? piece : activeSep + piece;
        const candidate = currentChunk + withSep;

        if (estimateTokens(candidate) <= chunkSize) {
            // Still fits — keep accumulating
            currentChunk = candidate;
        } else {
            // Doesn't fit

            if (currentChunk.trim()) {
                results.push(currentChunk.trim());

                // Build overlap: keep tail of current chunk
                const overlapCharCount = overlap * 4; // convert tokens → chars
                const tail = currentChunk.slice(-overlapCharCount);
                currentChunk = tail + withSep;
            } else {
                // Single piece is already over the limit — recurse deeper
                if (remainingSeps.length > 0 && estimateTokens(withSep) > chunkSize) {
                    const subChunks = splitRecursive(withSep, remainingSeps, chunkSize, overlap);
                    results.push(...subChunks);
                    currentChunk = '';
                } else {
                    // Hard-accept oversized piece — no further separator available
                    results.push(withSep.trim());
                    currentChunk = '';
                }
            }
        }
    }

    // Push whatever remains
    if (currentChunk.trim()) {
        results.push(currentChunk.trim());
    }

    // Filter out trivially small fragments (< 30 chars)
    return results.filter(r => r.trim().length >= 30);
}

/**
 * Extracts the nearest Markdown heading before a given character position.
 * Used to tag each chunk with its section heading.
 */
function extractHeading(fullText, chunkText) {
    const chunkStart = fullText.indexOf(chunkText);
    if (chunkStart === -1) return '';

    const textBefore = fullText.substring(0, chunkStart);
    const lines = textBefore.split('\n');

    // Walk backwards to find last heading line
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('#')) {
            return line.replace(/^#+\s*/, '').trim();
        }
    }

    return '';
}

/**
 * Main entry point.
 * Splits a document into semantic chunks.
 *
 * @param {string} text - Full document text
 * @param {object} options
 * @param {number} options.chunkSize   - Max tokens per chunk (default: 300)
 * @param {number} options.overlap     - Overlap tokens between chunks (default: 40)
 * @param {string} options.fileType    - 'md', 'txt', 'js', 'mjs', 'json' (default: 'txt')
 * @returns {Array<{ text: string, heading: string }>}
 */
function splitDocument(text, options = {}) {
    const {
        chunkSize = 300,
        overlap = 40,
        fileType = 'txt'
    } = options;

    const separators = ['js', 'mjs', 'ts'].includes(fileType)
        ? CODE_SEPARATORS
        : MARKDOWN_SEPARATORS;

    const rawChunks = splitRecursive(text, separators, chunkSize, overlap);

    return rawChunks.map(chunkText => ({
        text: chunkText,
        heading: extractHeading(text, chunkText)
    }));
}

module.exports = { splitDocument, estimateTokens };
