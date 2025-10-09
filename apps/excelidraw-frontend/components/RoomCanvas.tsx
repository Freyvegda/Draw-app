"use client";

import { WS_URL } from "@/config";
import { useEffect, useState, useRef } from "react";
import Canvas from "./Canvas";

interface RoomCanvasProps {
  roomId: string;
  token: string; // Pass JWT token as a prop
}

export function RoomCanvas({ roomId, token }: RoomCanvasProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token) return;

    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setSocket(ws);
        ws.send(JSON.stringify({ type: "join_room", roomId }));
      };

      ws.onclose = (e) => {
        console.log("WebSocket closed, retrying in 2s...", e.reason);
        setSocket(null);
        // Try reconnecting after 2 seconds
        reconnectRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.close();
    };
  }, [roomId, token]);

  if (!socket) {
    return <div>Connecting to server...</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
