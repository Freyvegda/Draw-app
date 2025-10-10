import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";


// --- Setup ---
const wss = new WebSocketServer({ port: 8080 });
console.log("✅ WebSocket server running on ws://localhost:8080");

// --- Types ---
type User = {
  ws: WebSocket;
  rooms: string[];
  userId: string;
};

type IncomingMessage = {
  type: "join_room" | "leave_room" | "chat" | "delete";
  roomId: string;
  message?: string;
};

// --- In-memory store of connected users ---
const users: User[] = [];

// --- Helper: JWT Verification ---
function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload & { userId: string };
    return decoded?.userId || null;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

// --- WebSocket Handlers ---
wss.on("connection", (ws, request) => {
  ws.on("error", console.error);

  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    console.warn(" Unauthorized connection attempt");
    ws.close();
    return;
  }

  const user: User = { ws, rooms: [], userId };
  users.push(user);

  console.log(`User connected: ${userId} (${users.length} total)`);

  // --- Handle incoming messages ---
  ws.on("message", async (rawData) => {
    try {
      const parsedData: IncomingMessage =
        typeof rawData === "string" ? JSON.parse(rawData) : JSON.parse(rawData.toString());

      const { type, roomId, message } = parsedData;

      switch (type) {
        // --- JOIN ROOM ---
        case "join_room": {
          if (!user.rooms.includes(roomId)) user.rooms.push(roomId);
          console.log(`User ${user.userId} joined room ${roomId}`);
          break;
        }

        // --- LEAVE ROOM ---
        case "leave_room": {
          user.rooms = user.rooms.filter((r) => r !== roomId);
          console.log(`User ${user.userId} left room ${roomId}`);
          break;
        }

        // --- CHAT / DRAW / MOVE SHAPE ---
        case "chat": {
          if (!message) return;

          // Save to DB
          await prismaClient.chat.create({
            data: { userId, roomId, message, type: "chat" },
          });

          // Broadcast to all users in the same room
          broadcastToRoom(roomId, {
            type: "chat",
            message,
            roomId,
            userId,
          });

          break;
        }

        // --- DELETE SHAPE ---
        case "delete": {
          if (!message) return;

          // Persist deletion in DB (for replay consistency)
          await prismaClient.chat.create({
            data: { userId, roomId, message, type: "delete" },
          });

          // Broadcast deletion event
          broadcastToRoom(roomId, {
            type: "delete",
            message,
            roomId,
            userId,
          });

          console.log(`Shape deleted by ${userId} in room ${roomId}`);
          break;
        }

        default:
          console.warn("Unknown message type:", type);
      }
    } catch (err) {
      console.error("Failed to handle message:", err);
      ws.send(JSON.stringify({ type: "error", msg: "Invalid message format" }));
    }
  });

  // --- Handle disconnect ---
  ws.on("close", () => {
    console.log(`User disconnected: ${userId}`);
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) users.splice(index, 1);
  });
});

// --- Helper: Broadcast to all users in a given room ---
function broadcastToRoom(roomId: string, payload: Record<string, any>) {
  users.forEach((u) => {
    if (u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
      u.ws.send(JSON.stringify(payload));
    }
  });
}
