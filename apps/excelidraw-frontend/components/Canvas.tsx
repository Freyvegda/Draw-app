import { useEffect, useRef, useState } from "react";
import { InitDraw } from "@/draw";

export default function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roomName, setRoomName] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current) {
      InitDraw(canvasRef.current, roomId, socket).then((name) => {
        setRoomName(name);
      });
    }
  }, [canvasRef, roomId, socket]);

  return (
    <div className="flex flex-col items-center bg-black">
      <h2 className="text-2xl font-semibold mb-4 text-white ">
        {roomName || "Loading room..."}
      </h2>

      <canvas ref={canvasRef} width={2000} height={1000}></canvas>
    </div>
  );
}
