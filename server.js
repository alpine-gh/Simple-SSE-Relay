const http = require('http');
const http2 = require('http2');

const clients = new Map();

const LOGS = process.env.LOGS === 'true';
const SERVER_PROTOCOL = (process.env.SERVER_PROTOCOL || 'http').toLowerCase();
const USE_HTTP2 = SERVER_PROTOCOL === 'http2';

if (SERVER_PROTOCOL !== 'http' && SERVER_PROTOCOL !== 'http2') {
  console.warn(`[${new Date().toISOString()}] Invalid SERVER_PROTOCOL "${process.env.SERVER_PROTOCOL}". Falling back to http.`);
}

const log = (message) => {
  if (LOGS) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
};

const server = (USE_HTTP2 ? http2 : http).createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const host = req.headers.host || req.headers[':authority'] || `localhost:${PORT}`;
  const url = new URL(req.url, `http://${host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Recipient connects to /events (GET /events/{sessionID})
  // Will automatically create a session if it doesn't exist. 
  if (req.method === 'GET' && pathParts[0] === 'events' && pathParts[1]) {
    const sessionId = pathParts[1];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...(USE_HTTP2 ? {} : { 'Connection': 'keep-alive' })
    });

    if (!clients.has(sessionId)) {
      clients.set(sessionId, new Set());
    }
    clients.get(sessionId).add(res);

    log(`[+] Client connected to session: ${sessionId} | Total listeners: ${clients.get(sessionId).size}`);

    res.write(`data: {"status": "connected"}\n\n`); 

    req.on('close', () => {
      const sessionClients = clients.get(sessionId);
      if (sessionClients) {
        sessionClients.delete(res);
        log(`[-] Client disconnected from session: ${sessionId} | Remaining listeners: ${sessionClients.size}`);
        
        if (sessionClients.size === 0) {
          clients.delete(sessionId);
          log(`[x] Session ${sessionId} ended (no active listeners).`);
        }
      }
    });
    return;
  }
   // Sender sends via /publish (POST /events/{sessionID})
  if (req.method === 'POST' && pathParts[0] === 'publish' && pathParts[1]) {
    const sessionId = pathParts[1];
    let body = '';

    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const sessionClients = clients.get(sessionId);
      
      log(`Message sent in session: ${sessionId} | Payload: ${body}`);

      if (sessionClients && sessionClients.size > 0) {
        sessionClients.forEach(client => {
          client.write(`data: ${body}\n\n`);
        });
        log(`Successfully pushed to ${sessionClients.size} listener(s).`);
      } else {
        log(`[!] /events/${sessionId} has no listeners. Are you sure your recipient opened a session on http://{your_sse_url}:3000/events/${sessionId}? | Payload: ${body}`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, active_listeners: sessionClients ? sessionClients.size : 0 }));
    });
    return;
  }

  log(`[?] 404 Not Found: ${req.method} ${req.url}`);
  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] SSE Relay Server running on port ${PORT} over ${USE_HTTP2 ? 'HTTP/2' : 'HTTP/1.1'}. Verbose logging: ${LOGS}`);
});