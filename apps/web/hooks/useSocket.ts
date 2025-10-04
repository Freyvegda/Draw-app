"use client"
import { useEffect, useState } from "react"
import { WS_URL } from "../app/config";

export function useSocket(){
    const [loading, setLoading] = useState(true);
    const [socket, setSocket ] = useState<WebSocket>();

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YjU4Mzk0MC0wOTk4LTQ3NGYtYTJhOC02ZDdiMzRjOGUzMTciLCJpYXQiOjE3NTk0MjI4OTl9.EqExVuaCt5grrBEYbEYLgp7qpgp5BaaFsdi4FkjkoI0`)
        ws.onopen= () =>{
            setLoading(false);
            setSocket(ws);
        }
    }, [])

    return {
        socket, loading
    }
}