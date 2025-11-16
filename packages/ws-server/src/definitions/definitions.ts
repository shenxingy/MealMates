// ============================================
// Client -> Server Messages (Incoming)
// ============================================

/**
 * client joins event
 */
export interface UserJoinEventMessage {
  type: "join_event";
  payload: {
    userId: string;
    eventId: number;
  };
}

/**
 * client shares location update
 */
export interface UserShareLocationMessage {
  type: "share_location";
  payload: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

/**
 * client leaves event
 */
export interface UserLeaveEventMessage {
  type: "leave_event";
  payload: Record<string, never>; // empty payload
}

/**
 * union type of all messages sent from client to server
 */
export type ClientMessage =
  | UserJoinEventMessage
  | UserShareLocationMessage
  | UserLeaveEventMessage;

// ============================================
// Server -> Client Messages (Outgoing)
// ============================================

/**
 * server confirms successful event join
 */
export interface JoinSuccessMessage {
  type: "join_success";
  payload: {
    userId: string;
    eventId: number;
    message: string;
  };
}

/**
 * server sends location update of a user
 */
export interface LocationUpdateMessage {
  type: "location_update";
  payload: {
    userId: string;
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

/**
 * server notifies that a user has left the event
 */
export interface UserLeftMessage {
  type: "user_left";
  payload: {
    userId: string;
  };
}

/**
 * server sends an error message to the client
 */
export interface ErrorMessage {
  type: "error";
  payload: {
    code: string;
    message: string;
  };
}

/**
 * union type of all messages sent from server to client
 */
export type ServerMessage =
  | JoinSuccessMessage
  | LocationUpdateMessage
  | UserLeftMessage
  | ErrorMessage;

// ============================================
// Type Validation Functions
// ============================================

export function isJoinEventMessage(
  msg: ClientMessage,
): msg is UserJoinEventMessage {
  return msg.type === "join_event";
}

export function isShareLocationMessage(
  msg: ClientMessage,
): msg is UserShareLocationMessage {
  return msg.type === "share_location";
}

export function isLeaveEventMessage(
  msg: ClientMessage,
): msg is UserLeaveEventMessage {
  return msg.type === "leave_event";
}
