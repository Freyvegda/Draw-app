/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";

export default function JoinRoomPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // On mount: load token from localStorage
  useEffect(() => {
    setIsClient(true);
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  if (!isClient) return null;

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center text-lg">
        Please sign in to continue.
      </div>
    );
  }


  // JOIN ROOM
  async function handleJoinRoom() {
    setLoading(true);
    setError("");
    setShowCreateButton(false);
    setShowCreateInput(false);

    try {
      const res = await fetch(`${HTTP_BACKEND}/room/${roomName}`, {
        headers: {
          ...(token ? { Authorization: token } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const roomId = data?.room?.id;
        if (roomId) {
          router.push(`/canvas/${roomId}`);
        } else {
          setError("Room does not exist.");
          setShowCreateButton(true);
        }
      } else if (res.status === 404) {
        setError("Room does not exist.");
        setShowCreateButton(true);
      } else if (res.status === 401 || res.status === 403) {
        setError("Unauthorized. Please sign in again.");
        localStorage.removeItem("token");
        router.push("/signin");
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.msg || "Failed to join room");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setShowCreateButton(true);
    } finally {
      setLoading(false);
    }
  }


  // CREATE ROOM
  async function handleCreateRoom() {
    setLoading(true);
    setError("");

    try {
      if (!newRoomName.trim()) {
        setError("Please enter a room name");
        setLoading(false);
        return;
      }

      const res = await fetch(`${HTTP_BACKEND}/room/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({ roomName: newRoomName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.msg || "Failed to create room");
      }

      const data = await res.json();
      const roomId = data.roomId;
      router.push(`/canvas/${roomId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not create room");
    } finally {
      setLoading(false);
    }
  }

 
  return (
    <div className="min-h-screen bg-[#fdf6ee] flex items-center justify-center">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold mb-6">Join a Room</h1>

        {/* JOIN INPUT */}
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="border border-gray-300 rounded-xl w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          onClick={handleJoinRoom}
          disabled={loading || !roomName.trim()}
          className="bg-orange-500 text-white rounded-xl w-full py-3 hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Room"}
        </button>

        {/* ERROR MESSAGE */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* SHOW CREATE BUTTON IF ROOM DOESN'T EXIST */}
        {showCreateButton && !showCreateInput && (
          <div className="mt-6">
            <button
              onClick={() => setShowCreateInput(true)}
              className="bg-green-500 text-white rounded-xl w-full py-2 hover:bg-green-600 transition"
            >
              Create Room
            </button>
          </div>
        )}

        {/* SHOW CREATE INPUT WHEN BUTTON CLICKED */}
        {showCreateInput && (
          <div className="mt-6">
            <input
              type="text"
              placeholder="Enter new room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="border border-gray-300 rounded-xl w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleCreateRoom}
              disabled={loading || !newRoomName.trim()}
              className="bg-green-500 text-white rounded-xl w-full py-3 hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create & Join Room"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
