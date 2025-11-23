export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface SimpleEventDTO {
  id: number;
  avatarUrl?: string;
  avatarColor?: string;
  username: string;
  scheduleTime: string;
  mood?: string;
  meetPoint: string;
  restaurantName: string;
  message?: string;
}

export interface DetailedEventDTO extends SimpleEventDTO {
  meetPointCoordinates: {
    latitude: number;
    longitude: number;
  };
  // Optional, restaurant can be decided later
  restaurantCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface JoinSuccessPayload {
  userId: string;
  eventId: number;
  message: string;
}

export interface LocationUpdatePayload {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface UserLeftPayload {
  userId: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

export interface MessageHandlers {
  onJoinSuccess?: (message: JoinSuccessPayload) => void;
  onLocationUpdate?: (message: LocationUpdatePayload) => void;
  onUserLeft?: (message: UserLeftPayload) => void;
  onError?: (message: ErrorPayload) => void;
}

export interface UseApiSocketOptions {
  userId: string;
  eventId: string;
  enabled: boolean;
  handlers?: MessageHandlers;
}

export interface ServerMessage {
  type: "join_success" | "location_update" | "user_left" | "error";
  payload:
    | JoinSuccessPayload
    | LocationUpdatePayload
    | UserLeftPayload
    | ErrorPayload;
}

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
    username: string;
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
