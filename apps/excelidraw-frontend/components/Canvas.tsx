"use client";

import { useEffect, useRef, useState } from "react";
import { initDraw } from "@/draw"; // ← ensure this matches your export name
import IconButton from "./IconButton";
import { Circle, Pencil, RectangleHorizontal, Moon, Sun } from "lucide-react";

type Shape = "circle" | "rect" | "pencil";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<Shape>("circle");
  const [darkMode, setDarkMode] = useState(true);

  // Load dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkmode");
    if (saved !== null) {
      setDarkMode(saved === "true");
    }
  }, []);

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem("darkmode", darkMode.toString());
  }, [darkMode]);

  // Store the selected tool globally for initDraw to access
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    window.selectedTool = selectedTool;
  }, [selectedTool]);

  // Initialize drawing logic
  useEffect(() => {
    if (canvasRef.current) {
      initDraw(canvasRef.current, roomId, socket, darkMode).then((name)=>{
        setRoomName(name);
      })
    }
  }, [canvasRef, roomId, socket, darkMode]);

  return (
    <div
      className={`relative flex flex-col items-center h-screen w-screen overflow-hidden transition-colors duration-300 ${
        darkMode ? "bg-black text-white" : "bg-[#fdf6ee] text-black"
      }`}
    >
      {/* Room title */}
      <h2
        className={`text-2xl font-semibold mb-4 z-20 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        {roomName || "Loading room..."}
      </h2>

      {/* Drawing canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute top-0 left-0"
      />

      {/* Toolbar (shapes) */}
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

      {/* Dark mode toggle */}
      <Darkmode darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Shape;
  setSelectedTool: (s: Shape) => void;
}) {
  return (
    <div className="fixed top-5 left-5 z-30">
      <div className="flex flex-col gap-2">
        <IconButton
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
          onClick={() => setSelectedTool("pencil")}
        />
        <IconButton
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontal />}
          onClick={() => setSelectedTool("rect")}
        />
        <IconButton
          activated={selectedTool === "circle"}
          icon={<Circle />}
          onClick={() => setSelectedTool("circle")}
        />
      </div>
    </div>
  );
}

export function Darkmode({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  return (
    <div className="fixed top-5 right-5 z-30">
      <IconButton
        activated={darkMode}
        icon={darkMode ? <Sun color="yellow" /> : <Moon />}
        onClick={() => setDarkMode(!darkMode)}
      />
    </div>
  );
}
