"use client";

import { useEffect, useRef } from "react"

export default function Canvas(){
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(()=>{
        if(canvasRef.current){
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            if(!context){
                return 
            }
            // added clicked logic to track the shape size and width
            let clicked = false
            let startX = 0;
            let startY = 0;
            canvas.addEventListener("mousedown", (e)=>{
                //when clicked mouse start the mousemove
                clicked= true
                //record the starting cordinates
                startX= e.clientX;;
                startY= e.clientY;
            })

            canvas.addEventListener("mouseup", (e)=>{
                //when stop holding the mouse record that event
                clicked =false
                console.log(e.clientX);;
                console.log(e.clientY);
            })

            canvas.addEventListener("mousemove", (e)=>{
                if(clicked){
                    //consider the move event only when the mouse is clicked
                    const width = e.clientX-startX;
                    const height = e.clientY- startY;
                    context.clearRect(0,0, canvas.width, canvas.height);
                    context.strokeRect(startX, startY, width, height)
                }
            })
        }
    }, [canvasRef])

    return <div>
        <canvas ref={canvasRef} width={500} height={500}></canvas>
    </div>
}