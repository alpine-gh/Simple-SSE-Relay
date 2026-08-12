# Simple SSE relay using Node

This is a simple script to establish an SSE relay with Node 20 + Docker (+ TailScale - optional). 

Although this was made for an n8n workflow (to create a AI agent chat with an SSE Trigger), it can be used for virtually anything that needs bi-directional SSE communication.

# How to install
1. Clone/download this repo
2. `docker compose up -d`

# How to use
1. Start and open a channel using `GET` to `/events/{session_id}`   
**Note: `session_id` can be whatever you want, if you open `http://your_sse_url:3000/events/chat`, a session called `chat` will be created. Sessions are automatically deleted when the last listener disconnects**

2. Send JSON messages via `POST` to `/publish/{session_id}`. (JSON can be in any schema format as long as it's valid code.)

# Settings

|Docker Env Variable |Value |Description |
|---|---|---|
|LOGS |`true`/`false` |Set to `true` by default. Posts payload information. |
## Important: You probably shouldn't run this over the open internet, as there is no auth built-in. This is intended to be run via TailScale or on your local network, the `docker-compose` contains a commented out TailScale sidecar for your convenience.  
