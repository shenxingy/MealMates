import {
  ClientMessage,
  isJoinEventMessage,
  isShareLocationMessage,
  ServerMessage,
} from "../definitions/definitions";
import {
  AuthenticatedWebSocket,
  eventConnectionMap,
  userConnectionMap,
} from "../socket-manager";

/**
 * Send a message to a specific WebSocket client
 */
function sendMessage(ws: AuthenticatedWebSocket, message: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * broadcast a message to all clients in an event
 */
function broadcastToEvent(
  eventId: number,
  message: ServerMessage,
  excludeWs?: AuthenticatedWebSocket,
) {
  const connections = eventConnectionMap.get(eventId);
  if (!connections) return;

  connections.forEach((clientWs) => {
    if (clientWs !== excludeWs && clientWs.readyState === clientWs.OPEN) {
      clientWs.send(JSON.stringify(message));
    }
  });
}

/**
 * handle user authentication
 * @param ws AuthenticatedWebSocket
 * @param data ClientMessage
 * @param authTimeout NodeJS.Timeout
 */
function handleUserJoinEvent(
  ws: AuthenticatedWebSocket,
  data: ClientMessage,
  authTimeout: NodeJS.Timeout,
) {
  if (!isJoinEventMessage(data)) {
    console.warn(
      "[SocketManager] Expected join_event message type for authentication.",
    );
    sendMessage(ws, {
      type: "error",
      payload: {
        code: "INVALID_MESSAGE_TYPE",
        message: "Expected join_event message type",
      },
    });
    ws.close();
    return;
  }

  if (!data.payload.userId || !data.payload.eventId) {
    console.warn("[SocketManager] Message missing required register fields.");
    sendMessage(ws, {
      type: "error",
      payload: {
        code: "MISSING_FIELDS",
        message: "Missing userId or eventId",
      },
    });
    ws.close();
    return;
  }

  clearTimeout(authTimeout);
  const userId = data.payload.userId;
  const eventId = data.payload.eventId;
  ws.userId = userId;
  ws.eventId = eventId;

  // store connection
  userConnectionMap.set(userId.toString(), ws);
  eventConnectionMap.set(
    eventId,
    eventConnectionMap.get(eventId)?.add(ws) ||
      new Set<AuthenticatedWebSocket>().add(ws),
  );

  // respond with success message
  sendMessage(ws, {
    type: "join_success",
    payload: {
      userId,
      eventId,
      message: `Successfully joined event ${eventId}`,
    },
  });

  console.log(
    `[SocketManager] User ${userId} joined event ${eventId} successfully.`,
  );
}

/**
 * handle share location event
 * @param ws AuthenticatedWebSocket
 * @param data ClientMessage
 */
function handleShareLocationEvent(
  ws: AuthenticatedWebSocket,
  data: ClientMessage,
) {
  if (!isShareLocationMessage(data)) {
    console.warn("[SocketManager] Expected share_location message type.");
    sendMessage(ws, {
      type: "error",
      payload: {
        code: "INVALID_MESSAGE_TYPE",
        message: "Expected share_location message type",
      },
    });
    return;
  }

  const { latitude, longitude, timestamp, username } = data.payload;

  // broadcast location update to other users in the same event
  if (ws.eventId && ws.userId) {
    broadcastToEvent(
      ws.eventId,
      {
        type: "location_update",
        payload: {
          userId: ws.userId,
          username,
          latitude,
          longitude,
          timestamp,
        },
      },
      ws, // exclude sender
    );

    console.log(
      `[SocketManager] User ${ws.userId} shared location in event ${ws.eventId}`,
    );
  }
}

/**
 * handle user leave event
 * @param ws AuthenticatedWebSocket
 */
function handleUserLeaveEvent(ws: AuthenticatedWebSocket) {
  if (!ws.userId || !ws.eventId) {
    return;
  }

  const eventId = ws.eventId;
  const userId = ws.userId;

  // remove connection
  userConnectionMap.delete(userId.toString());
  const eventConnections = eventConnectionMap.get(eventId);
  if (eventConnections) {
    eventConnections.delete(ws);
    if (eventConnections.size === 0) {
      eventConnectionMap.delete(eventId);
    }
  }

  // notify other users in the event
  broadcastToEvent(eventId, {
    type: "user_left",
    payload: {
      userId,
    },
  });

  console.log(`[SocketManager] User ${userId} left event ${eventId}`);
}

export {
  handleUserJoinEvent,
  handleShareLocationEvent,
  handleUserLeaveEvent,
  sendMessage,
  broadcastToEvent,
};
