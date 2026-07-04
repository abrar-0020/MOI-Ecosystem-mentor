'use strict';

// =====================================================
// Prompt Builder
//
// Constructs the full prompt sent to Ollama.
//
// Structure:
//   [System persona]
//   [Previous conversation — last 3 exchanges]
//   [Retrieved documentation chunks]
//   [User question]
//   [Guidelines]
//
// Key design decisions:
//  - "Use as primary source" (not "ONLY use") to avoid
//    the model refusing obvious, helpful answers
//  - Conversation history enables follow-up questions
//  - Sources cited at the bottom with 📄 emoji
// =====================================================

const getSystemPersona = (hasChunks = true) => {
    let persona = `==========================
MOI ECOSYSTEM MENTOR
RESPONSE STYLE
==========================

You are an expert MOI ecosystem mentor.
Your goal is not only to answer questions but to teach the user clearly while remaining technically accurate.
Always answer using the indexed documentation as the primary source.
Never invent information. Never expand acronyms unless the documentation explicitly defines them.
STRICT RULE: Do NOT start every answer with "MOI is...". Instead, use custom, strong opening sentences. (e.g. "The MOI ecosystem consists of...", "The MOI architecture revolves around...", "Deploying a Cocolang contract involves...").`;


    persona += `\n\n==========================
INTENT-BASED RESPONSE FORMAT
==========================

Do NOT use a rigid template for every answer. Instead, detect the user's intent and choose the most appropriate structure automatically. Do not output sections that don't make sense for the chosen intent.

1. Definition Question ("What is...?")
# [Topic Name]
(Strong custom explanation)
## 🧩 Components (Use well-spaced ASCII tree hierarchy wrapped in a \`\`\`text code block)
Example tree:
\`\`\`text
MOI Platform

├── Cocolang
│     └── Smart Contract Language
│
├── Native Assets
│     └── MAS0 Standard
\`\`\`
## 💡 Why it Matters
## 💭 Did You Know? (Provide a highly memorable, cross-cutting fact from the docs)
## 🔌 Key APIs (e.g. • VoyageProvider() • LogicFactory())
## 🔄 Used by (e.g. ✓ Wallet ✓ AssetFactory)

2. Workflow Question ("How do I...?")
# [Action Name]
## ✅ Prerequisites
## 🛠️ Steps (Numbered list)
## 💻 Commands (e.g. node register.mjs - DO NOT invent commands)
## ⚠️ Troubleshooting

3. Code Question ("Explain this file")
# [File Name]
## 🎯 Purpose
## 📝 Internally (Use rich vertical arrow flows like Developer ↓ LogicFactory ↓ Manifest ↓ VoyageProvider)
## 🔌 Relevant APIs
## 📂 Repository References (e.g. 📂 session-3/register.mjs)
## ❌ Common Mistakes

4. Comparison Question ("Compare X vs Y")
# [X vs Y]
## 📊 Comparison Table
## ⚖️ Differences
## 🎯 Use Cases

5. Error Troubleshooting ("account not found")
# [Error Message]
## 🔍 Cause
## 🩺 Diagnosis
## 🛠️ Fix
## 🛡️ Prevention

6. Architecture Question
# [Architecture Name]
## 🗺️ Diagram (Use rich vertical arrow flows like Developer ↓ Wallet ↓ VoyageProvider wrapped in a \`\`\`text code block)
## 🧩 Components
## 🔄 Flow`;



    persona += `\n\n==================================
SITUATIONAL RULES
==================================
- WHEN INFORMATION IS MISSING: Say: "I couldn't find sufficient information about this in the indexed MOI documentation."
- VISUAL LEARNING: Emphasize spacing in trees and arrows in workflows. ALWAYS wrap ASCII art or flow diagrams in \`\`\`text code blocks.
- CONCISENESS: Keep your answers extremely concise and direct. Do not exceed 150 words per section. Stop generating once the question is answered.
- ERRORS: Only use realistic errors mentioned in the context.
- STYLE: Premium, polished, conversational, professional but friendly.`;

    return persona;
};

/**
 * Formats conversation history as a readable block.
 *
 * @param {Array<{role: string, content: string}>} history
 * @returns {string}
 */
function formatHistory(history) {
    if (!history || history.length === 0) return '';

    const lines = history.map(msg => {
        const label = msg.role === 'user' ? 'User' : 'Assistant';
        // Truncate very long past messages to save tokens
        const content = msg.content.length > 300
            ? msg.content.substring(0, 300) + '...'
            : msg.content;
        return `${label}: ${content}`;
    });

    return [
        'PREVIOUS CONVERSATION:',
        '━'.repeat(40),
        lines.join('\n\n'),
        '━'.repeat(40)
    ].join('\n');
}

/**
 * Formats retrieved chunks as a readable context block.
 *
 * @param {Array<object>} chunks - Chunk records from LanceDB
 * @returns {string}
 */
function formatContext(chunks) {
    if (!chunks || chunks.length === 0) {
        return 'RETRIEVED DOCUMENTATION:\n' + '━'.repeat(40) + '\n(No relevant documentation found)\n' + '━'.repeat(40);
    }

    const chunkBlocks = chunks.map((chunk, i) => {
        const sourceLabel = chunk.source || 'unknown';
        const headingLabel = chunk.heading ? ` | Section: ${chunk.heading}` : '';
        return `[${i + 1}] Source: ${sourceLabel}${headingLabel}\n${chunk.text}`;
    });

    return [
        'RETRIEVED DOCUMENTATION:',
        '━'.repeat(40),
        chunkBlocks.join('\n\n---\n\n'),
        '━'.repeat(40)
    ].join('\n');
}



/**
 * Builds the complete Ollama message array.
 *
 * @param {object} params
 * @param {string}        params.query      - User's current question
 * @param {Array<object>} params.chunks     - Retrieved LanceDB chunks
 * @param {Array<object>} params.sources    - Source metadata for citations
 * @param {Array<object>} params.history    - Conversation history (up to 6 msgs)
 * @returns {Array<{role: string, content: string}>} Ollama messages array
 */
function buildMessages({ query, chunks, sources, history = [] }) {
    const historyBlock = formatHistory(history);
    const contextBlock = formatContext(chunks);

    const userContent = [
        historyBlock,
        historyBlock ? '' : null,  // blank line after history
        contextBlock,
        '',
        `QUESTION: ${query}`
    ].filter(line => line !== null).join('\n');

    const hasChunks = chunks && chunks.length > 0;
    
    return [
        {
            role: 'system',
            content: getSystemPersona(hasChunks)
        },
        {
            role: 'user',
            content: userContent
        }
    ];
}

/**
 * Builds a fallback message when the RAG system isn't ready.
 * (e.g., index not yet built)
 *
 * @param {string} query
 * @param {Array<object>} history
 * @returns {Array<{role: string, content: string}>}
 */
function buildFallbackMessages(query, history = []) {
    const historyBlock = formatHistory(history);

    return [
        {
            role: 'system',
            content: getSystemPersona(false)
        },
        {
            role: 'user',
            content: [
                historyBlock,
                '',
                `QUESTION: ${query}`,
                '',
                'Note: The knowledge base index is not yet built.',
                'Answer from your training knowledge about MOI if possible,',
                'but note that you may not have the most current information.'
            ].filter(Boolean).join('\n')
        }
    ];
}

module.exports = { buildMessages, buildFallbackMessages, formatContext, formatHistory };
