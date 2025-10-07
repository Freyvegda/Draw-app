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

    return <div className="flex flex-col items-center justify-center w-screen h-screen bg-red-400">
        <div className="flex flex-col items-center justify-center w-full max-w-md flex-grow overflow-y-auto p-4">
            {chats.map((m, idx) => (
                <div key={idx} className="bg-white rounded-lg px-4 py-2 mb-2 shadow">
                    {m.message}
                </div>
            ))}
        </div>
        <div className="flex items-center justify-center w-full max-w-md p-4 bg-red-300 rounded-lg">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Enter message"
          className="flex-1 p-2 border rounded-l-lg outline-none"
        />
        <button
          onClick={() => {
            socket?.send(
              JSON.stringify({
                type: "chat",
                roomId: roomId,
                message: currentMessage,
              })
            );
            setCurrentMessage("");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
        
    
}