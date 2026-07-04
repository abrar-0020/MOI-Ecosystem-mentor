'use strict';

// =====================================================
// Conversation History Store
//
// In-memory session store keyed by sessionId.
// Keeps last 3 exchanges (6 messages) per session.
// Sessions expire after 30 minutes of inactivity.
//
// This enables users to ask follow-up questions like:
//   "What about the previous command?"
//   "Can you expand on that?"
// =====================================================

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_HISTORY = 6;                  // 3 user + 3 assistant messages

/** @type {Map<string, { history: Array<{role:string, content:string}>, lastActivity: number }>} */
const sessions = new Map();

// Periodic garbage collection to prevent memory leaks (runs every 10 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions.entries()) {
        if (now - session.lastActivity > SESSION_TTL_MS) {
            sessions.delete(id);
        }
    }
}, 10 * 60 * 1000).unref(); // unref so it doesn't block Node from exiting

/**
 * Retrieves conversation history for a session.
 * Returns empty array if session doesn't exist or has expired.
 *
 * @param {string} sessionId
 * @returns {Array<{role: string, content: string}>}
 */
function getHistory(sessionId) {
    if (!sessionId) return [];

    const session = sessions.get(sessionId);
    if (!session) return [];

    // Check expiry
    if (Date.now() - session.lastActivity > SESSION_TTL_MS) {
        sessions.delete(sessionId);
        return [];
    }

    return session.history;
}

/**
 * Appends a message to conversation history.
 * Automatically trims to MAX_HISTORY.
 *
 * @param {string} sessionId
 * @param {'user'|'assistant'} role
 * @param {string} content
 */
function addMessage(sessionId, role, content) {
    if (!sessionId) return;

    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, { history: [], lastActivity: Date.now() });
    }

    const session = sessions.get(sessionId);
    session.lastActivity = Date.now();

    session.history.push({ role, content });

    // Trim oldest messages when over limit
    if (session.history.length > MAX_HISTORY) {
        session.history = session.history.slice(-MAX_HISTORY);
    }
}

/**
 * Clears history for a session (e.g., user starts a new chat).
 *
 * @param {string} sessionId
 */
function clearHistory(sessionId) {
    sessions.delete(sessionId);
}

/**
 * Returns stats about active sessions (for /status endpoint).
 */
function getStats() {
    // Clean up expired sessions first
    const now = Date.now();
    for (const [id, session] of sessions.entries()) {
        if (now - session.lastActivity > SESSION_TTL_MS) {
            sessions.delete(id);
        }
    }
    return { activeSessions: sessions.size };
}

module.exports = { getHistory, addMessage, clearHistory, getStats };
