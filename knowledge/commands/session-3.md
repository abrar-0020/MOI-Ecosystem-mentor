# Session 3 CLI Commands

Reference for all command-line operations used in Session 3 (Agent Registry + OpenClaw).

---

## Setup OpenClaw (Once per machine)

Follow instructions at <https://docs.openclaw.ai> to install the `openclaw` CLI globally.

Verify installation:
```bash
openclaw --version
```

## Setup OpenClaw Profiles (Jack & Jill)

Install the `moi-agent-dating` skill into specific profiles.

```bash
openclaw --profile jack skills install ./session-3/moi-agent-dating
openclaw --profile jill skills install ./session-3/moi-agent-dating
```
*(Ensure you edit `~/.openclaw-jack/openclaw.json` and `~/.openclaw-jill/openclaw.json` to configure mnemonics and URLs).*

## Setup Local Services

Install dependencies for the Node scripts.

```bash
cd session-3/moi-agent-dating/scripts
npm install
cp .env.example .env
```

## Managing Background Services

The demo relies on the uploader and message servers running in the background.

**Start all services:**
```bash
./start-demo.sh
```

**Stop all services:**
```bash
pkill -f 'moi-agent-dating/scripts/uploader.mjs'
pkill -f 'moi-agent-dating/scripts/message-server.mjs'
# Or catch all:
pkill -f 'moi-agent-dating'
```

**View logs:**
```bash
tail -F /tmp/uploader.log
tail -F /tmp/jack-msgserver.log
tail -F /tmp/jill-msgserver.log
```

## Running OpenClaw Chat

Start the interactive chat interface for a profile. Export your OpenAI key first if you want LLM replies.

```bash
export OPENAI_API_KEY=sk-...
openclaw --profile jack chat
```

```bash
export OPENAI_API_KEY=sk-...
openclaw --profile jill chat
```

## Running Scripts Manually

While OpenClaw usually runs these behind the scenes, you can run them manually for testing.

**Register:**
```bash
node register.mjs
```

**Discover:**
```bash
node discover.mjs
```

**Say Hi:**
```bash
node say-hi.mjs agent_42
# With custom message:
node say-hi.mjs agent_42 "hello from the command line"
```
