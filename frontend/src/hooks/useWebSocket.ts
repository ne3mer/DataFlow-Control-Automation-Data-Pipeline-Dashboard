import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!url) return;
    
    // Construct full URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = baseUrl.replace('http', 'ws') + url;
    
    let isMounted = true;
    let shouldReconnect = true;

    const connect = () => {
      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          if (isMounted) {
            // Only log in non-dev or when actually needed
            if (import.meta.env.DEV) {
              // Suppress in dev mode to reduce noise
            }
          }
        };

        ws.current.onmessage = (event) => {
          if (!isMounted) return;
          const message = event.data;
          try {
            const parsed = JSON.parse(message);
            setLastMessage(parsed);
            setMessages((prev) => [...prev, parsed]);
          } catch (e) {
            // Not JSON
            setLastMessage(message);
            setMessages((prev) => [...prev, message]);
          }
        };

        ws.current.onerror = (error) => {
          // Suppress "closed before connection established" errors (React StrictMode)
          // These are harmless and happen when React unmounts/remounts components in dev mode
          if (ws.current?.readyState === WebSocket.CLOSED || ws.current?.readyState === WebSocket.CLOSING) {
            return;
          }
          // Only log actual connection errors, not cleanup errors
          const target = error.target as WebSocket;
          if (target?.readyState !== WebSocket.CLOSED && target?.readyState !== WebSocket.CLOSING) {
            console.error('WebSocket error:', error);
          }
        };

        ws.current.onclose = (event) => {
          // Don't log normal closures (code 1000) or React StrictMode closures
          if (event.code !== 1000 && event.code !== 1001) {
            // Only log unexpected closures
          }
          
          // Attempt reconnect if component is still mounted and it wasn't a manual close
          if (isMounted && shouldReconnect && event.code !== 1000) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted && shouldReconnect) {
                connect();
              }
            }, 3000);
          }
        };
      } catch (error) {
        // Suppress "closed before connection established" errors
        if (error instanceof Error && error.message.includes('closed before')) {
          return;
        }
        console.error('WebSocket connection error:', error);
      }
    };

    connect();

    return () => {
      isMounted = false;
      shouldReconnect = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close(1000, 'Component unmounted');
        ws.current = null;
      }
    };
  }, [url]);

  return { messages, lastMessage };
};
