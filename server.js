'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Ollama } = require('ollama');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { retrieve } = require('./rag/retriever');
const { buildMessages, buildFallbackMessages } = require('./rag/promptBuilder');
const { getHistory, addMessage, clearHistory, getStats: getHistoryStats } = require('./rag/history');
const { getStats: getVectorStats } = require('./rag/vectorStore');

// =====================================================
// Server Configuration
// =====================================================

const app = express();
const PORT = process.env.PORT || 3940;
const MODEL = process.env.LLM_MODEL || 'gemma4:latest';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

app.set('trust proxy', 1); // Respect X-Forwarded-For if behind a proxy
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after a minute' }
});

app.use('/message', apiLimiter);
app.use('/roadmap', apiLimiter);
app.use('/quiz', apiLimiter);
app.use('/projects', apiLimiter);
app.use('/clear', apiLimiter);
app.use('/status', apiLimiter);

const ollama = new Ollama({ host: OLLAMA_HOST });

// =====================================================
// RAG State
// =====================================================

let ragReady = false;

// Warm up vector store connection on startup
(async () => {
    try {
        const stats = await getVectorStats();
        if (stats.count > 0) {
            ragReady = true;
            console.log(`✅ RAG ready — ${stats.count} chunks in vector store`);
        } else {
            console.warn('⚠️  Vector store is empty.');
            console.warn('   Run: npm run ingest');
            console.warn('   The server will still answer using LLM base knowledge.');
        }
    } catch {
        console.warn('⚠️  Vector store not initialized yet. Run: npm run ingest');
    }
})();

// =====================================================
// Core RAG Response Engine
// =====================================================

/**
 * Generates a RAG-powered response.
 *
 * Pipeline:
 *  1. Load conversation history for session
 *  2. Retrieve relevant chunks (dynamic top-K)
 *  3. Build prompt with history + chunks + question
 *  4. Call Ollama LLM
 *  5. Store exchange in history
 *  6. Return reply + sources
 *
 * @param {string} query       - User question
 * @param {string} sessionId   - UUID for conversation continuity
 * @param {number} maxTokens   - Max tokens to generate (default: 700)
 * @param {boolean} stream     - Whether to return an async generator for streaming
 * @returns {Promise<{ reply: string, sources: Array } | { stream: AsyncGenerator, sources: Array }>}
 */
async function ragResponse(query, sessionId, maxTokens = 700, stream = false) {
    // 1. Load conversation history
    const history = getHistory(sessionId);

    let messages;
    let sources = [];

    if (ragReady) {
        // 2. Retrieve relevant chunks
        const result = await retrieve(query);
        sources = result.sources;

        // 3. Build RAG prompt
        messages = buildMessages({
            query,
            chunks: result.chunks,
            sources: result.sources,
            history
        });
    } else {
        // Fallback: LLM without RAG (vector store empty/not built)
        messages = buildFallbackMessages(query, history);
    }

    // 4. Call Ollama
    const response = await ollama.chat({
        model: MODEL,
        messages,
        options: {
            temperature: 0.2,
            num_predict: maxTokens,
            num_ctx: 4096
        },
        stream: stream
    });

    if (stream) {
        return { stream: response, sources };
    }

    const reply = response.message?.content || 'I could not generate a response.';

    // 5. Store in conversation history
    addMessage(sessionId, 'user', query);
    addMessage(sessionId, 'assistant', reply);

    return { reply, sources };
}

// =====================================================
// ROUTES
// =====================================================

// Home — JSON info
app.get('/', (req, res) => {
    res.json({
        agent: 'MOI Ecosystem Mentor',
        status: 'online',
        version: '5.0.0',
        rag: ragReady ? 'active' : 'not indexed',
        model: MODEL
    });
});

// Serve chat UI
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -----------------------------------------------
// POST /message — Main chat endpoint
// -----------------------------------------------
app.post('/message', async (req, res) => {
    try {
        const { text, sessionId } = req.body;

        if (typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ error: 'Please provide a valid question string in the "text" field.' });
        }
        
        if (sessionId && typeof sessionId !== 'string') {
            return res.status(400).json({ error: 'sessionId must be a string.' });
        }

        const sid = sessionId || 'default';
        console.log(`💬 [${sid.substring(0, 8)}] ${text}`);

        // Custom greeting interception
        const normalizedText = text.trim().toLowerCase();
        const greetings = ['hi', 'hello', 'hey', 'greetings', 'hola', 'hi!', 'hello!'];
        if (greetings.includes(normalizedText)) {
            return res.json({
                reply: "👋 Welcome to the MOI Ecosystem Mentor.\n\nI can help you understand:\n\n• MOI Architecture\n• Cocolang\n• Native Assets (MAS0)\n• Agent Registry\n• OpenClaw\n• SDK & Deployment\n\nAsk me anything about the MOI ecosystem.",
                sessionId: sid,
                sources: []
            });
        }

        const startTime = Date.now();
        const { stream, sources } = await ragResponse(text, sid, 2048, true);
        
        // Setup SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send sources immediately
        res.write(`data: ${JSON.stringify({ sources })}\n\n`);

        let fullReply = '';
        for await (const chunk of stream) {
            const token = chunk.message?.content || '';
            fullReply += token;
            res.write(`data: ${JSON.stringify({ text: token })}\n\n`);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`⏱️  [${sid.substring(0, 8)}] Stream finished in ${duration}s`);
        
        // Save to history
        addMessage(sid, 'user', text);
        addMessage(sid, 'assistant', fullReply);

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

    } catch (error) {
        console.error('[/message] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------
// POST /roadmap — Learning roadmap generator
// -----------------------------------------------
app.post('/roadmap', async (req, res) => {
    try {
        const { topic = 'MOI Development', sessionId } = req.body;
        
        if (typeof topic !== 'string') {
            return res.status(400).json({ error: 'topic must be a string.' });
        }

        const sid = sessionId || 'default';

        console.log(`🗺️  Roadmap request: ${topic}`);

        const query = `Create a detailed, step-by-step learning roadmap for: ${topic}. Include prerequisites, key concepts, and practical exercises.`;
        const { reply, sources } = await ragResponse(query, sid, 1200);

        res.json({ roadmap: reply, sessionId: sid, sources });

    } catch (error) {
        console.error('[/roadmap] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------
// POST /quiz — Quiz generator
// -----------------------------------------------
app.post('/quiz', async (req, res) => {
    try {
        const { topic = 'MOI', sessionId } = req.body;
        
        if (typeof topic !== 'string') {
            return res.status(400).json({ error: 'topic must be a string.' });
        }

        const sid = sessionId || 'default';

        console.log(`🧠 Quiz request: ${topic}`);

        const query = `Generate 5 multiple-choice questions about ${topic} with 4 answer options each. Mark the correct answer and provide a brief explanation. Base questions only on the provided documentation.`;
        const { reply, sources } = await ragResponse(query, sid, 1500);

        res.json({ quiz: reply, sessionId: sid, sources });

    } catch (error) {
        console.error('[/quiz] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------
// POST /projects — Project idea generator
// -----------------------------------------------
app.post('/projects', async (req, res) => {
    try {
        const { level = 'beginner', sessionId } = req.body;
        
        if (typeof level !== 'string') {
            return res.status(400).json({ error: 'level must be a string.' });
        }

        const sid = sessionId || 'default';

        console.log(`💡 Projects request: ${level}`);

        const query = `Suggest 5 ${level}-level MOI ecosystem project ideas. For each project include: name, description, MOI features used, and implementation steps. Base suggestions on the actual MOI capabilities documented.`;
        const { reply, sources } = await ragResponse(query, sid, 1200);

        res.json({ projects: reply, sessionId: sid, sources });

    } catch (error) {
        console.error('[/projects] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------
// POST /clear — Clear conversation history
// -----------------------------------------------
app.post('/clear', (req, res) => {
    const { sessionId } = req.body;
    
    if (typeof sessionId !== 'string') {
        return res.status(400).json({ error: 'sessionId must be a valid string.' });
    }
    
    if (sessionId) {
        clearHistory(sessionId);
        res.json({ message: 'Conversation history cleared.', sessionId });
    } else {
        res.status(400).json({ error: 'sessionId is required.' });
    }
});

// -----------------------------------------------
// GET /status — Health check + RAG stats
// -----------------------------------------------
app.get('/status', async (req, res) => {
    try {
        const vectorStats = await getVectorStats();
        const historyStats = getHistoryStats();

        res.json({
            status: 'online',
            rag: {
                ready: ragReady,
                chunksIndexed: vectorStats.count,
                model: process.env.EMBED_MODEL || 'nomic-embed-text'
            },
            llm: {
                model: MODEL,
                host: OLLAMA_HOST
            },
            sessions: historyStats.activeSessions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================================================
// Start Server
// =====================================================

app.listen(PORT, () => {
    console.log(`\n🚀 MOI Ecosystem Mentor v5.0 running on port ${PORT}`);
    console.log(`   Chat UI:  http://localhost:${PORT}/chat`);
    console.log(`   Status:   http://localhost:${PORT}/status`);
    console.log(`   LLM:      ${MODEL} via ${OLLAMA_HOST}`);
    console.log(`\n   To index documents: npm run ingest\n`);
});