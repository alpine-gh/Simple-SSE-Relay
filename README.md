# Simple SSE relay using Node

This is a simple script to establish an SSE relay with Node 20 + Docker. 

# How to use
1. Open listener using `/events/{session_id}`
(Note: `session_id` can be whatever you want, if you open `http://your_sse_url:3000/events/chat`, a session called `chat` will be created. Sessions are automatically deleted when the last listener disconnects
2. Send messages using `/publish/{session_id}`

# Settings
The only setting is for logging:
|Docker Env Variable |Value |Default |
|---|---|---|
|LOGS |`bool` |`true` |
## Important: You probably shouldn't run this over the open internet, as there is no auth built-in. This is intended to be run via TailScale or on your local network, the `docker-compose` contains a commented out TailScale sidecar for your convenience.  
