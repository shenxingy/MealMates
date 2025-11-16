import * as dotenv from 'dotenv';
dotenv.config();
import * as http from 'http';

const PORT = process.env.WS_PORT || 3001;

const server = http.createServer()
server.listen(PORT, () => {
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
})
