import axios from "axios";
import { HTTP_BACKEND } from "../config"

type Shape={
    type: "rect",
    x: number;
    y: number;
    width: number;
    height: number; 
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number
}


export async function InitDraw(canvas: HTMLCanvasElement, roomId: string,socket: WebSocket ){
    const context = canvas.getContext("2d");

    const { shapes: existingShapes, roomName } = await getExistingShapes(roomId);
    
    if(!context){
        return 
    }

    clearCanvas(existingShapes, canvas, context);
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if(message.type === "chat"){
            const parsedShape = JSON.parse(message.message)
            existingShapes.push(parsedShape);
            clearCanvas(existingShapes, canvas, context, )
        }
    }
    

    // added clicked logic to track the shape size and width
    clearCanvas(existingShapes, canvas, context)
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
        const width = e.clientX-startX;
        const height = e.clientY- startY;

        const selectedTool = "circle";
        let shape : Shape | null = null;
        if(selectedTool === "rect"){
            shape = {
                type: "rect",
                x: startX,
                y: startY,
                height, 
                width
            }
        }
        else if(selectedTool === "circle"){
            const radius = Math.abs(Math.max(width, height) / 2);
            shape = {
                type: "circle",
                centerX: startX + radius,
                centerY: startY+ radius,
                radius: radius
            }
        }
        if(!shape){
            return;
        }
        existingShapes.push(shape)
        clearCanvas(existingShapes, canvas, context)


        socket.send(JSON.stringify({
            type : "chat",
            message: JSON.stringify({
                shape
            }),
            roomId
        }))
    })

    canvas.addEventListener("mousemove", (e)=>{
        if(clicked){
            //consider the move event only when the mouse is clicked
            const width = e.clientX-startX;
            const height = e.clientY- startY;
            clearCanvas(existingShapes, canvas, context)
            context.strokeStyle= "rgba(255,255,255)"

            const selectedTool = "circle";
            if(selectedTool === "rect"){
                context.strokeRect(startX, startY, width, height)
            }
            else if(selectedTool === "circle"){
                const radius = Math.abs(Math.max(height, width) / 2);
                const centerX = startX + radius;
                const centerY = startY + radius;
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, Math.PI*2);
                context.stroke();
                context.closePath();
            }
        }
    })
    return roomName
}

function clearCanvas(existingShapes: Shape[], canvas:HTMLCanvasElement,  context: CanvasRenderingContext2D){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0,0,0)"
    context.fillRect(0, 0, canvas.width, canvas.height)

    existingShapes.map((shape)=>{
        if(shape.type === "rect"){
            context.strokeStyle= "rgba(255,255,255)";
            context.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }
        else if(shape.type === "circle"){
            context.beginPath();
            context.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            context.stroke();
            context.closePath();  
        }
    })
}

async function getExistingShapes(roomId : string){
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const {messages,roomName} = res.data;

    const shapes = messages.map((x: {message: string})=>{
        const messageData = JSON.parse(x.message);
        return messageData.shape
    })

    return {shapes, roomName};
}