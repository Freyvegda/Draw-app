"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter();

  return (
    <div className= "flex w-screen h-screen justify-center items-center bg-red-400">
      <div className="">
        <input type="text" className="p-3 m-5" value= {roomId} placeholder="Room ID" onChange={(e)=>{
          setRoomId(e.target.value) 
        }}></input>

        <button className="border-2 p-2 border-black rounded-lg" onClick={()=>{
          router.push(`room/${roomId}`)
        }}>Join the room</button>
      </div>
    </div>
  );
}

