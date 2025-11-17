import { useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import type {
  ErrorPayload,
  JoinSuccessPayload,
  LocationUpdatePayload,
  ServerMessage,
  UseApiSocketOptions,
  UserLeftPayload,
} from "~/definition";

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
      console.log('[useApiSocket] WebSocket connected, sending join_event');
      sendJsonMessage({
        type: 'join_event',
        payload: {
          userId,
          eventId: parseInt(eventId, 10),
        },
      });
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
          handlers?.onJoinSuccess?.(message.payload as JoinSuccessPayload);
          break;
        case 'location_update':
          handlers?.onLocationUpdate?.(message.payload as LocationUpdatePayload);
          break;
        case 'user_left':
          handlers?.onUserLeft?.(message.payload as UserLeftPayload);
          break;
        case 'error':
          handlers?.onError?.(message.payload as ErrorPayload);
          break;
        default:
          console.warn('[useApiSocket] Unknown message type:', message);
      }
    }
  }, [lastJsonMessage, handlers]);

  // send share location update
  const shareLocation = (latitude: number, longitude: number) => {
    if (readyState === ReadyState.OPEN && shouldConnect) {
      console.log('[useApiSocket] Sharing location:', { latitude, longitude });
      sendJsonMessage({
        type: 'share_location',
        payload: {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  // send leave event
  const leaveEvent = () => {
    if (readyState === ReadyState.OPEN && shouldConnect) {
      console.log('[useApiSocket] Leaving event');
      sendJsonMessage({
        type: 'leave_event',
        payload: {},
      });
    }
  };

  return {
    shareLocation,
    leaveEvent,
    readyState,
    isConnected: readyState === ReadyState.OPEN,
  };
}
