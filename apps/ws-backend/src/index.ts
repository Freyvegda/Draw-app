import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({port: 8080});

type User = {
    ws: WebSocket
    rooms : string[]
    userId: String
}

const users: User[] = []

function checkUser(token: string): string | null{
    try{
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {userId: string};
        if(!decoded || !(decoded as JwtPayload).userId){
            return null;
        }
        return decoded.userId;
    }
    catch(err){
        console.error(err);
        return null;
    }
}

wss.on('connection', function connection(ws, request){
    ws.on('error', console.error);

    const url = request.url
    if(!url){
        return;
    }
    
    const queryparams = new URLSearchParams(url.split('?')[1]);
    const token = queryparams.get('token') || "";
    const userId = checkUser(token);
    if(userId == null){
        ws.close();
        return null;
    } 

    users.push({
        userId,
        rooms: [],
        ws
    })

    
    ws.on("message", async function message(data) {
    let parsedData: any;
    try {
        const text = typeof data === "string" ? data : data.toString();
        parsedData = JSON.parse(text);
    } catch (err) {
        console.error("Invalid JSON:", data.toString());
        return;
    }

    // ---- JOIN ROOM ----
    if (parsedData.type === "join_room") {
        const user = users.find(x => x.ws === ws);
        if (user) {
            if (!user.rooms.includes(parsedData.roomId)) {
                user.rooms.push(parsedData.roomId);
            }
            console.log(`User ${user.userId} joined room ${parsedData.roomId}`);
        }
    }

    // ---- LEAVE ROOM ----
    if (parsedData.type === "leave_room") {
        const user = users.find(x => x.ws === ws);
        if (user) {
            user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
            console.log(`User ${user.userId} left room ${parsedData.roomId}`);
        }
    }

    // ---- CHAT ----
    if (parsedData.type === "chat") {
        const roomId = parsedData.roomId.toString();
        const message = parsedData.message;

        const chat = await prismaClient.chat.create({
            data: {
                userId,
                roomId,
                message
            }
        });
        console.log("Saved chat:", chat);

        // Broadcast to all users in the same room
        users.forEach(user => {
            if (user.rooms.includes(roomId)) {
                user.ws.send(JSON.stringify({
                    type: "chat",
                    message,
                    roomId,
                    userId  // add sender ID so frontend knows who sent it
                }));
            }
        });
    }
});

})