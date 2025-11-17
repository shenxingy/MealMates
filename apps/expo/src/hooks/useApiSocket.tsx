import { useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';



import type {
  ErrorPayload,
  JoinSuccessPayload,
  LocationUpdatePayload,
  ServerMessage,
  UseApiSocketOptions,
  UserJoinEventMessage,
  UserLeaveEventMessage,
  UserLeftPayload,
  UserShareLocationMessage,
} from "~/definition";
import { getStoredUsername } from "~/utils/user-storage";


const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WEBSOCKET_URL ?? "ws://localhost:3001";

export function useApiSocket({
  userId,
  eventId,
  enabled,
  handlers,
}: UseApiSocketOptions) {
  const shouldConnect = enabled && !!userId && !!eventId;
  const hasJoined = useRef(false);

  // Use ref to store handlers to avoid effect re-runs when handlers object changes
  const handlersRef = useRef(handlers);
  const username = useRef("");

  // Update handlers ref when handlers change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const loadUsername = async () => {
      const usernameFromStorage = await getStoredUsername();
      username.current = usernameFromStorage ?? "Anonymous";
    }
    void loadUsername();
  })

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_BASE_URL,
    {
      shouldReconnect: () => shouldConnect,
      reconnectAttempts: 3,
      reconnectInterval: 3000,
    },
    shouldConnect,
  );

  // send join_event when connected
  useEffect(() => {
    if (readyState === ReadyState.OPEN && shouldConnect && !hasJoined.current) {
      const message: UserJoinEventMessage = {
        type: 'join_event',
        payload: {
          userId,
          eventId: parseInt(eventId, 10),
        },
      };
      sendJsonMessage(message);
      console.log('[useApiSocket] WebSocket connected, sending join_event');
      hasJoined.current = true;
    }

    if (readyState !== ReadyState.OPEN) {
      hasJoined.current = false;
    }
  }, [readyState, shouldConnect, userId, eventId, sendJsonMessage]);

  // handle incoming messages
  useEffect(() => {
    if (lastJsonMessage) {
      const message = lastJsonMessage as ServerMessage;
      console.log('[useApiSocket] Received message:', message);

      switch (message.type) {
        case 'join_success':
          handlersRef.current?.onJoinSuccess?.(message.payload as JoinSuccessPayload);
          break;
        case 'location_update':
          handlersRef.current?.onLocationUpdate?.(message.payload as LocationUpdatePayload);
          break;
        case 'user_left':
          handlersRef.current?.onUserLeft?.(message.payload as UserLeftPayload);
          break;
        case 'error':
          handlersRef.current?.onError?.(message.payload as ErrorPayload);
          break;
        default:
          console.warn('[useApiSocket] Unknown message type:', message);
      }
    }
  }, [lastJsonMessage]);

  // send share location update
  const shareLocation = (latitude: number, longitude: number) => {
    if (readyState === ReadyState.OPEN && shouldConnect) {
      const message: UserShareLocationMessage = {
        type: 'share_location',
        payload: {
          username: username.current,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        },
      }
      sendJsonMessage(message);
      console.log('[useApiSocket] Sharing location:', message);
    }
  };

  // send leave event
  const leaveEvent = () => {
    if (readyState === ReadyState.OPEN && shouldConnect) {
      const message: UserLeaveEventMessage = {
        type: 'leave_event',
        payload: {},
      }
      sendJsonMessage(message);
      console.log('[useApiSocket] Leaving event');
    }
  };

  return {
    shareLocation,
    leaveEvent,
    readyState,
    isConnected: readyState === ReadyState.OPEN,
  };
}
