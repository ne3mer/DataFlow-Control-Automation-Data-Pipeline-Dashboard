import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // const token = localStorage.getItem('token');
    // Note: Standard WebSocket API doesn't support headers, so we might need to pass token in query param
    // or use a library that supports it, or rely on cookies.
    // For this demo, we'll assume the backend accepts token in query param or we skip auth for WS for now.
    // Let's try passing it in query param if needed, or just connect.
    
    // Construct full URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = baseUrl.replace('http', 'ws') + url;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.current.onmessage = (event) => {
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

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return { messages, lastMessage };
};
