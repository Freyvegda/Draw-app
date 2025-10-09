/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

// 👇 main initDraw function with dark mode parameter
export async function initDraw(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    darkMode: boolean
    ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const {messages, roomName} = res.data; 



    const existingShapes: Shape[] = await getExistingShapes(roomId);

    ctx.fillStyle = darkMode ? "#000" : "#fdf6ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // initial render
    clearCanvas(existingShapes, canvas, ctx, darkMode);

        
    // websocket listener
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        existingShapes.push(parsedShape.shape);
        clearCanvas(existingShapes, canvas, ctx, darkMode);
        }
    };

    let clicked = false;
    let startX = 0;
    let startY = 0;

    // mouse down
    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX - canvas.getBoundingClientRect().left;
        startY = e.clientY - canvas.getBoundingClientRect().top;
    });

    // mouse up (finalize shape)
    canvas.addEventListener("mouseup", (e) => {
        if (!clicked) return;
        clicked = false;

        const endX = e.clientX - canvas.getBoundingClientRect().left;
        const endY = e.clientY - canvas.getBoundingClientRect().top;
        const width = endX - startX;
        const height = endY - startY;

        // @ts-ignore
        const selectedTool = window.selectedTool;
        let shape: Shape | null = null;

        if (selectedTool === "rect") {
        shape = {
            type: "rect",
            x: startX,
            y: startY,
            width,
            height,
        };
        } else if (selectedTool === "circle") {
        const radius = Math.abs(Math.max(width, height) / 2);
        shape = {
            type: "circle",
            centerX: startX + radius,
            centerY: startY + radius,
            radius,
        };
        }

        if (!shape) return;

        existingShapes.push(shape);
        clearCanvas(existingShapes, canvas, ctx, darkMode);

        socket.send(
        JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId,
        })
        );
    });

    // mouse move (preview while dragging)
    canvas.addEventListener("mousemove", (e) => {
        if (!clicked) return;

        const endX = e.clientX - canvas.getBoundingClientRect().left;
        const endY = e.clientY - canvas.getBoundingClientRect().top;
        const width = endX - startX;
        const height = endY - startY;

        clearCanvas(existingShapes, canvas, ctx, darkMode);

        ctx.strokeStyle = darkMode ? "#ffffff" : "#000000";
        // @ts-ignore
        const selectedTool = window.selectedTool;

        if (selectedTool === "rect") {
        ctx.strokeRect(startX, startY, width, height);
        } else if (selectedTool === "circle") {
        const radius = Math.abs(Math.max(width, height) / 2);
        const centerX = startX + radius;
        const centerY = startY + radius;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        }
    });
    return roomName;
}


// 🎨 clears + redraws all shapes
function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  darkMode: boolean
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = darkMode ? "#000000" : "#fdf6ee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = darkMode ? "#ffffff" : "#000000";
  existingShapes.forEach((shape) => {
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
  });


}

// 📦 get shapes from backend
async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const messages = res.data.messages;

  const shapes = messages
    .map((x: { message: string }) => {
      try {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return shapes;
}
