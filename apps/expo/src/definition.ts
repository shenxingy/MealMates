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
  emoji?: string;
  status?:
    | "waiting_for_participant"
    | "participant_joined"
    | "success"
    | "deleted";
  hostSuccessConfirmed?: boolean;
  participantSuccessConfirmed?: boolean;
  meetPoint: string;
  restaurantName: string;
  message?: string;
}

export interface DetailedEventDTO extends SimpleEventDTO {
  userId: string;
  meetPointCoordinates: {
    latitude: number;
    longitude: number;
  };
  // Optional, restaurant can be decided later
  restaurantCoordinates?: {
    latitude: number;
    longitude: number;
  };
  participants?: EventParticipantDTO[];
}

export interface JoinSuccessPayload {
  userId: string;
  eventId: number;
  message: string;
}

export interface ParticipantJoinedPayload {
  userId: string;
  eventId: number;
}

export interface EventParticipantDTO {
  id: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  joinedAt: string | null;
  successConfirmed?: boolean;
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
  onParticipantJoined?: (message: ParticipantJoinedPayload) => void;
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
  type:
    | "join_success"
    | "participant_joined"
    | "location_update"
    | "user_left"
    | "error";
  payload:
    | JoinSuccessPayload
    | ParticipantJoinedPayload
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

export interface Post {
  id: string;
  title: string;
  content: string;
  image: string;
  user: string;
  userAvatar: string | null;
  userColor: string;
  time: string;
  likes: number;
  liked: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  content: string;
  image: string | undefined;
  user: string;
  userAvatar: string | null;
  userColor: string;
  likes: number;
  liked: boolean;
}
