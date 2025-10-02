import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

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

    ws.on('message', function message(data){
        const parsedData = JSON.parse(data as unknown as string);

        if(parsedData.type == "join_room"){
            const user = users.find(x=>x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type == "leave_room"){
            const user = users.find(x => x.ws === ws);
            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x === parsedData.room)
        }

        if(parsedData.type == "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            users.forEach(user =>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })

        }
    })
})