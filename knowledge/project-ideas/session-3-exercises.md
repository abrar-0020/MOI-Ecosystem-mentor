# Session 3: Practical Exercises

Expand upon the OpenClaw and Agent Registry demonstrations with these exercises.

---

## 1. Custom Agent Personas
1. Modify `./start-demo.sh` to include a custom `AGENT_PERSONA` environment variable for Jack.
2. E.g., `AGENT_PERSONA="You are a sarcastic pirate agent."`
3. Restart the services and use `say-hi.mjs` to send a message to Jack. Observe how the LLM adopts the persona.

## 2. The Third Agent
1. Create a third message server instance listening on port `:3942`.
2. Give it a new name (e.g., `AGENT_NAME=Bob`).
3. Create a third OpenClaw profile (`~/.openclaw-bob/openclaw.json`) pointing to `:3942`.
4. Register Bob and have Jack, Jill, and Bob all discover and message each other.

## 3. Broadcast Script
Write a Node.js script called `broadcast.mjs` that:
1. Reads all registered agents using `discover.mjs` logic.
2. Loops through the resulting list.
3. Sends a POST request to every single valid `url` it finds, saying "Hello from the broadcast script!".

## 4. Parameterized Messages
Modify `say-hi.mjs` to accept advanced JSON payloads rather than just a string text.
For example, send `{ "from": "...", "intent": "trade", "offer": 100 }` and observe how the receiving LLM handles structured JSON input in the message server.

## 5. Custom OpenClaw Skill
Using the `moi-agent-dating` skill as a template, write a brand new skill (e.g., `moi-token-checker`).
1. Write a Node.js script that takes an address and queries its devnet MOI token balance.
2. Write a JSON5 skill manifest that maps the intent "check my devnet balance" to your new script.
3. Install the skill in OpenClaw and ask the agent to check your balance.
