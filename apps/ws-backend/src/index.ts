import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

type User = {
  ws: WebSocket;
  rooms: string[];
  userId: string;
};

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: string };
    return decoded?.userId || null;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

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
    ws.close();
    return;
  }

  const user: User = { ws, rooms: [], userId };
  users.push(user);

  console.log(`User connected: ${userId}`);

  ws.on("message", async (data) => {
    try {
      let parsedData: any = typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString());

      // JOIN ROOM
      if (parsedData.type === "join_room") {
        if (!user.rooms.includes(parsedData.roomId)) {
          user.rooms.push(parsedData.roomId);
        }
        console.log(`User ${user.userId} joined room ${parsedData.roomId}`);
      }

      // LEAVE ROOM
      if (parsedData.type === "leave_room") {
        user.rooms = user.rooms.filter((r) => r !== parsedData.roomId);
        console.log(`User ${user.userId} left room ${parsedData.roomId}`);
      }

      // CHAT
      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId.toString();
        const message = parsedData.message;

        const chat = await prismaClient.chat.create({
          data: { userId, roomId, message },
        });

        // Broadcast to all users in the same room
        users.forEach((u) => {
          if (u.rooms.includes(roomId)) {
            u.ws.send(
              JSON.stringify({
                type: "chat",
                message,
                roomId,
                userId,
              })
            );
          }
        });
      }
    } catch (err) {
      console.error("Failed to handle message:", err);
      ws.send(JSON.stringify({ type: "error", msg: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    console.log(`User disconnected: ${userId}`);
    // Remove user from users array
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) users.splice(index, 1);
  });
});
