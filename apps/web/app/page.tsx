"use client"

import { useState } from "react";
import styles from "./page.module.css"
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter();

  return (
    <div className={styles.page}>
      <input type="text"  value= {roomId} placeholder="Room ID" onChange={(e)=>{
        setRoomId(e.target.value) 
      }}></input>

      <button onClick={()=>{
        router.push(`room/${roomId}`)
      }}>Join the room</button>
    </div>
  );
}

