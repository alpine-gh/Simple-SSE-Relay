# Simple SSE relay using Node

This is a simple script to establish an SSE relay with Node 20 + Docker (+ TailScale - optional). 

Although this was made for an n8n workflow (to create a AI agent chat with an SSE Trigger), it can be used for virtually any situation where bi-directional communication is needed and WebSockets aren't supported.

# How to install
1. Clone/download this repo
2. `docker compose up -d`  
### Important: You probably shouldn't run this over the open internet, as there is no auth built-in. This is intended to be run via TailScale or on your local network, the `docker-compose` contains a commented out TailScale sidecar for your convenience.  
# How to use  
### 1. Start and open a channel using `GET` to `/events/{session_id}`   
- `{session_id}` can be any string you choose. (If you open `/events/chat`, a channel called `chat` will be created.)
- Sessions are automatically created when the first listener connects and deleted when the last listener disconnects
- Multiple listeners can connect to the same session to receive the same messages
### 2. Send JSON messages via `POST` to `/publish/{session_id}`. (JSON can be in any schema format as long as it's valid code.)
- JSON payload can be in any valid format (no specific schema required)
- Messages are delivered to all active listeners on that session
- If no listeners are connected, the message is logged but not delivered
- The response includes the number of active listeners that received the message
  
# Settings

|Docker Env Variable |Value |Description |
|---|---|---|
|LOGS |`true`/`false` |Set to `true` by default. Posts payload information. |  
