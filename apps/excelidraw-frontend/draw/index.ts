import axios from "axios";
import { HTTP_BACKEND } from "../config";

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
    };

export async function InitDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  // 🧠 Fetch existing shapes first
  const { shapes: existingShapes, roomName } = await getExistingShapes(roomId);

  // 🖌️ Draw them immediately once fetched
  clearCanvas(existingShapes, canvas, context);

  // 🧩 Set up websocket listener AFTER initial draw
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "chat") {
      // The server sends { shape: {...} } inside message.message
      const parsed = JSON.parse(message.message);
      const shape = parsed.shape;

      if (shape) {
        existingShapes.push(shape);
        clearCanvas(existingShapes, canvas, context);
      }
    }
  };

  // 🖱️ Mouse event setup
  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX - canvas.getBoundingClientRect().left;
    startY = e.clientY - canvas.getBoundingClientRect().top;
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!clicked) return;
    clicked = false;

    const endX = e.clientX - canvas.getBoundingClientRect().left;
    const endY = e.clientY - canvas.getBoundingClientRect().top;
    const width = endX - startX;
    const height = endY - startY;

    const selectedTool = "circle";
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
    clearCanvas(existingShapes, canvas, context);

    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId,
      })
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;

    const endX = e.clientX - canvas.getBoundingClientRect().left;
    const endY = e.clientY - canvas.getBoundingClientRect().top;
    const width = endX - startX;
    const height = endY - startY;

    clearCanvas(existingShapes, canvas, context);
    context.strokeStyle = "rgba(255,255,255)";

    const selectedTool = "circle";
    if (selectedTool === "rect") {
      context.strokeRect(startX, startY, width, height);
    } else if (selectedTool === "circle") {
      const radius = Math.abs(Math.max(width, height) / 2);
      const centerX = startX + radius;
      const centerY = startY + radius;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.stroke();
      context.closePath();
    }
  });

  return roomName;
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) {
  // 🧼 Clear background
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(0,0,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 🖌️ Redraw all shapes
  existingShapes.forEach((shape) => {
    context.strokeStyle = "rgba(255,255,255)";
    if (shape.type === "rect") {
      context.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      context.beginPath();
      context.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      context.stroke();
      context.closePath();
    }
  });
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const { messages, roomName } = res.data;

  const shapes = messages
    .map((x: { message: string }) => {
      try {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
      } catch {
        return null;
      }
    })
    .filter(Boolean); // remove invalid entries

  return { shapes, roomName };
}
