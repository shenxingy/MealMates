import type { Server as HttpServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

import {
  ClientMessage,
  isLeaveEventMessage,
  isShareLocationMessage,
} from "./definitions/definitions";
import {
  handleShareLocationEvent,
  handleUserJoinEvent,
  handleUserLeaveEvent,
  sendMessage,
} from "./handler/websocket-handlers";

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  eventId?: number;
}

// connection map to track active connections
export const userConnectionMap = new Map<string, AuthenticatedWebSocket>();
export const eventConnectionMap = new Map<
  number,
  Set<AuthenticatedWebSocket>
>();

// authentication timeout
const AUTH_TIMEOUT_MS = 10000;

/**
 * Initializes the WebSocket server and sets up connection handling.
 * @param httpServer The HTTP server to attach the WebSocket server to.
 */
export function initWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
    console.log(
      `[SocketManager] Client connected from ${req.socket.remoteAddress}`,
    );

    const authTimeout = setTimeout(() => {
      // close connection if not authenticated in time
      if (!ws.userId) {
        console.log(
          "[SocketManager] Client failed to authenticate in time. Closing.",
        );
        ws.terminate();
      }
    }, AUTH_TIMEOUT_MS);

    // handle incoming messages
    ws.on("message", async (message: Buffer) => {
      let data: ClientMessage;
      try {
        data = JSON.parse(message.toString());
      } catch (error) {
        console.warn(
          "[SocketManager] Received invalid message format: ",
          error,
        );
        sendMessage(ws, {
          type: "error",
          payload: {
            code: "INVALID_JSON",
            message: "Invalid JSON format",
          },
        });
        ws.close();
        return;
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !data.type ||
        !data.payload
      ) {
        console.warn("[SocketManager] Received invalid message format.");
        sendMessage(ws, {
          type: "error",
          payload: {
            code: "INVALID_MESSAGE_FORMAT",
            message: "Message must have type and payload",
          },
        });
        ws.close();
        return;
      }

      try {
        if (!ws.userId || !ws.eventId) {
          handleUserJoinEvent(ws, data, authTimeout);
        } else {
          if (isShareLocationMessage(data)) {
            handleShareLocationEvent(ws, data);
          } else if (isLeaveEventMessage(data)) {
            handleUserLeaveEvent(ws);
            ws.close();
          } else {
            console.warn(
              `[SocketManager] Unknown message type: ${data.type}`,
            );
            sendMessage(ws, {
              type: "error",
              payload: {
                code: "UNKNOWN_MESSAGE_TYPE",
                message: `Unknown message type: ${data.type}`,
              },
            });
          }
        }
      } catch (error) {
        console.error(
          `[SocketManager] Error handling message (Unknown Payload):`,
          error,
        );
        sendMessage(ws, {
          type: "error",
          payload: {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
          },
        });
      }
    });

    // handle connection close
    ws.on("close", (code, reason) => {
      clearTimeout(authTimeout);
      if (ws.userId && ws.eventId) {
        handleUserLeaveEvent(ws);
        console.log(
          `[SocketManager] User ${ws.userId} disconnected from event ${ws.eventId}. (Code: ${code}, Reason: ${reason})`,
        );
      } else if (ws.userId) {
        if (userConnectionMap.get(ws.userId.toString()) === ws) {
          userConnectionMap.delete(ws.userId.toString());
        }
        console.log(
          `[SocketManager] User ${ws.userId} disconnected. (Code: ${code}, Reason: ${reason})`,
        );
      } else {
        console.log("[SocketManager] Unauthenticated client disconnected.");
      }
    });

    // handle errors
    ws.on("error", (error) => {
      console.error("[SocketManager] WebSocket error:", error);
    });
  });

  console.log(
    "[SocketManager] WebSocket server initialized and attached to HTTP server.",
  );
}
