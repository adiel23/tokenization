import { useEffect, useRef, useCallback, useState } from 'react';
import type { WebSocketMessage } from '@types';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnectInterval = 5000,
  reconnectAttempts = 5,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          onMessage?.(message);
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        // Attempt reconnect if not at max attempts
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        onError?.(error);
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnectInterval, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    wsRef.current?.close();
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    connect,
    disconnect,
  };
}

// Specialized hook for marketplace WebSocket
export function useMarketplaceWebSocket(tokenId: string | null) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const { isConnected, send } = useWebSocket({
    url: `wss://api.example.com/ws/marketplace${tokenId ? `?token=${tokenId}` : ''}`,
    onMessage: (message) => {
      setLastMessage(message);
    },
  });

  const subscribeToToken = useCallback((id: string) => {
    send({ action: 'subscribe', tokenId: id });
  }, [send]);

  const unsubscribeFromToken = useCallback((id: string) => {
    send({ action: 'unsubscribe', tokenId: id });
  }, [send]);

  return {
    isConnected,
    lastMessage,
    subscribeToToken,
    unsubscribeFromToken,
  };
}
