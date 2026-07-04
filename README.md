# MOI Ecosystem Mentor

An intelligent, local Retrieval-Augmented Generation (RAG) assistant designed to help developers learn, build, and deploy on the MOI blockchain. The tool references official documentation to provide precise answers about Cocolang, standard Native Assets (MAS0), custom token mechanics, the Agent Registry, and deployment workflows.

## Features

- Local Retrieval-Augmented Generation: Answers are grounded in actual MOI documentation using semantic vector search.
- Interactive Learning Pathways: Generates learning roadmaps, beginner-to-advanced project concepts, and knowledge check quizzes on demand.
- Low-Latency Streaming: Streams responses token-by-token using Server-Sent Events (SSE) to ensure immediate responsiveness.
- Session Management: Manages conversation context securely in memory with automatic session expiration and garbage collection to protect server resources.
- Modern Web Client: Features a fully responsive user interface built on Next.js, tailored with custom styles matching the MOI branding guidelines.

## Tech Stack

### Backend
- Runtime: Node.js (CommonJS)
- Server Framework: Express
- Vector Database: LanceDB
- Embeddings Model: nomic-embed-text
- LLM Provider: Ollama (gemma4:latest)
- Security: Helmet, Express Rate Limit

### Frontend
- Framework: Next.js (Client Component Architecture)
- Styling: Tailwind CSS
- Utilities: Lucide React, React Markdown, Remark GFM, React Syntax Highlighter

---

## Installation

### Prerequisites
1. Install Node.js (v18 or higher recommended).
2. Install Ollama.
3. Download and pull the required models in Ollama:
   ```bash
   ollama pull gemma4:latest
   ollama pull nomic-embed-text
   ```

### Setup

1. Install backend dependencies in the root directory:
   ```bash
   npm install
   ```
2. Install frontend dependencies inside the `chat-app` directory:
   ```bash
   cd chat-app
   npm install
   cd ..
   ```
3. Create a `.env` file in the root directory and configure the environment variables:
   ```env
   PORT=3940
   LLM_MODEL=gemma4:latest
   OLLAMA_HOST=http://127.0.0.1:11434
   EMBED_MODEL=nomic-embed-text
   ```

### Ingestion & Execution

1. Build the vector database by indexing the offline documentation:
   ```bash
   npm run ingest
   ```
2. Start the backend service:
   ```bash
   npm start
   ```
3. Start the Next.js development server to launch the chat interface:
   ```bash
   cd chat-app
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:3000`.
