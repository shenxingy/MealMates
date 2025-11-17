import * as dotenv from 'dotenv';
dotenv.config();
import * as http from 'http';
import { initWebSocketServer } from './src/socket-manager';

const PORT = process.env.WS_PORT || 3001;

const server = http.createServer();
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
