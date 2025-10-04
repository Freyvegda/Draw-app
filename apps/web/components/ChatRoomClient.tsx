/* eslint-disable react/jsx-key */
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
    messages,
    roomId
}:{
    messages : {message: string}[],
    roomId: string
}){
    const [chats, setChats] = useState(messages)
    const {socket, loading} = useSocket();
    const [currentMessage, setCurrentMessage] = useState("");

    useEffect(()=>{
        if(socket && !loading){
            socket.send(JSON.stringify({
                type: "join_room",
                roomId : roomId
            }))

            socket.onmessage = (event)=>{
                const parseData =  JSON.parse(event.data);
                if(parseData.type === "chat"){
                    //when new message comes load the before message and add the new message
                    setChats(c=> [...c,{message: parseData.message}])
                }
            }
         }

        return ()=>{
            socket?.close()
        }
    }, [socket, loading, roomId])

    return <div>
        <div>
            {messages.map(m => <div>
                {m.message}
            </div>)}
        </div>

        <input type="text" value={currentMessage} onChange={e=>{
            setCurrentMessage(e.target.value) 
        }} placeholder="Enter message"></input>

        <button onClick={()=>{
            socket?.send(JSON.stringify({
                type: "chat", roomId: roomId, message: currentMessage
            })) 
            setCurrentMessage("")
        }}>
            Send Message
        </button>
    </div>
        
    
}