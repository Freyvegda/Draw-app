"use client";

import { useEffect, useRef, useState } from "react";
import { Game } from "@/draw/game"; // ← updated import
import IconButton from "./IconButton";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, DoorOpen } from "lucide-react";
import { Tool, Toolbar } from "./ToolBar";


export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");
  const [darkMode, setDarkMode] = useState(true);
  const gameRef = useRef<Game | null>(null);
  const router = useRouter();

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

  useEffect(()=>{

  })


  // Initialize Game instance
  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new Game(canvasRef.current, roomId, socket, darkMode);
    gameRef.current = game;

    game.init().then((name) => setRoomName(name.toUpperCase()));

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [canvasRef, roomId, socket, darkMode]);



  // Update selected tool dynamically
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.setTool(selectedTool);
    }
  }, [selectedTool]);

  const handleLogout=()=>{
    try{
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      socket.close();

      router.push("/");
    }
    catch(err){
      console.error("Error logging out", err);
    }
  }

  const handleJoiningAnotherRoom= ()=>{
    router.push("/room")
  }


  return (
    <div
      className={`relative flex flex-col items-center h-screen w-screen overflow-hidden transition-colors duration-300 ${
        darkMode ? "bg-black text-white" : "bg-[#ffd9b3] text-black"
      }`}
    >
      {/* Room title */}
      <h2
        className={`text-2xl font-semibold mb-4 z-20 mt-3 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        {roomName || "Loading room..."}
      </h2>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute top-0 left-0"
      />

      {/* Toolbar */}
      <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

      {/* Dark mode toggle */}
      <Darkmode darkMode={darkMode} setDarkMode={setDarkMode} />

      {/*Logout button */}  
      <LogoutButton onLogout={handleLogout} />
      
      {/*Logout button */}  
      <JoinAnotherRoom onJoinAnotherRoom={handleJoiningAnotherRoom}/>
    </div>
  );
}


// --- Dark mode toggle ---
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
        title="Darkmode"
      />
    </div>
  );
}


//logout button
function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-30">
      <IconButton
        activated={false}
        icon={<LogOut />}
        onClick={onLogout}
        title="Logout"
      />
    </div>
  );
}


function JoinAnotherRoom({onJoinAnotherRoom}: {onJoinAnotherRoom: ()=>void}){
  return <div className="top-5 right-20 fixed z-30">
    <button >
      <IconButton
        activated = {false}
        icon = {<DoorOpen/>}
        onClick = {onJoinAnotherRoom}
        title="Join Another Room"
      />
    </button>
  </div>
}