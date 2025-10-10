/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { Tool } from "@/components/ToolBar";

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "pencil"; startX: number; startY: number; endX: number; endY: number }
  | { type: "text"; x: number; y: number; value: string };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private socket: WebSocket;
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private darkMode: boolean;
  private selectedTool: Tool = "rect";

  private selectedShapeIndex: number | null = null;
  private isMoving = false;
  private moveOffsetX = 0;
  private moveOffsetY = 0;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    darkMode: boolean
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.darkMode = darkMode;

    this.init();
    this.initSocketHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("mousedown", this.mouseDownForMove);
    this.canvas.removeEventListener("contextmenu", this.handleRightClick);
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  // --- Initialize room and history ---
  async init() {
    // Fetch room’s chat history (draws + deletes)
    const res = await axios.get(`${HTTP_BACKEND}/chats/${this.roomId}`);
    const { messages, roomName } = res.data;

    this.existingShapes = [];

    for (const msg of messages) {
      const parsed = JSON.parse(msg.message);
      if (msg.type === "chat") {
        this.existingShapes.push(parsed.shape);
      } else if (msg.type === "delete") {
        this.existingShapes = this.existingShapes.filter(
          (s) => !this.isSameShape(s, parsed.shape)
        );
      }
    }

    this.clearCanvas();

    // Join WS room
    this.socket.send(
      JSON.stringify({
        type: "join_room",
        roomId: this.roomId,
      })
    );
    return roomName
  }

  // --- WebSocket message handling ---
  initSocketHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsed = JSON.parse(message.message);
        this.existingShapes.push(parsed.shape);
        this.clearCanvas();
      }

      if (message.type === "delete") {
        const parsed = JSON.parse(message.message);
        this.existingShapes = this.existingShapes.filter(
          (s) => !this.isSameShape(s, parsed.shape)
        );
        this.clearCanvas();
      }
    };
  }

  // --- Canvas Redraw ---
  clearCanvas() {
    const { ctx, canvas, darkMode } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = darkMode ? "#000000" : "#fdf6ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = darkMode ? "#ffffff" : "#000000";

    this.existingShapes.forEach((shape, i) => {
      ctx.beginPath();
      switch (shape.type) {
        case "rect":
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case "circle":
          ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "text":
          ctx.font = "16px sans-serif";
          ctx.fillStyle = darkMode ? "#ffffff" : "#000000";
          ctx.textBaseline = "top";
          ctx.fillText(shape.value, shape.x, shape.y);
          break;
      }
      ctx.closePath();

      // Highlight selected shape when moving
      if (i === this.selectedShapeIndex && this.isMoving) {
        ctx.save();
        ctx.strokeStyle = "orange";
        ctx.setLineDash([5, 3]);
        if (shape.type === "rect") {
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
          ctx.beginPath();
          ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.closePath();
        }
        ctx.restore();
      }
    });
  }

  // --- Mouse + Move Handlers ---
  mouseDownHandler = (e: MouseEvent) => {
    if (this.selectedTool === "move") return;
    if (this.selectedTool === "text") return;

    this.clicked = true;
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;
  };

  mouseDownForMove = (e: MouseEvent) => {
    if (this.selectedTool !== "move") return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const shapeIndex = this.findShapeAt(x, y);
    if (shapeIndex !== null) {
      this.selectedShapeIndex = shapeIndex;
      const shape = this.existingShapes[shapeIndex];
      if (shape.type === "rect") {
        this.moveOffsetX = x - shape.x;
        this.moveOffsetY = y - shape.y;
      } else if (shape.type === "circle") {
        this.moveOffsetX = x - shape.centerX;
        this.moveOffsetY = y - shape.centerY;
      } else if (shape.type === "text") {
        this.moveOffsetX = x - shape.x;
        this.moveOffsetY = y - shape.y;
      }
      this.isMoving = true;
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    // --- End move ---
    if (this.selectedTool === "move" && this.isMoving && this.selectedShapeIndex !== null) {
      this.isMoving = false;
      const movedShape = this.existingShapes[this.selectedShapeIndex];
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape: movedShape }),
          roomId: this.roomId,
        })
      );
      this.selectedShapeIndex = null;
      this.clearCanvas();
      return;
    }

    const rect = this.canvas.getBoundingClientRect();

    // --- Handle text ---
    if (this.selectedTool === "text") {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.addText(x, y);
      return;
    }

    if (!this.clicked) return;
    this.clicked = false;

    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const width = endX - this.startX;
    const height = endY - this.startY;

    let shape: Shape | null = null;
    if (this.selectedTool === "rect") {
      shape = { type: "rect", x: this.startX, y: this.startY, width, height };
    } else if (this.selectedTool === "circle") {
      const radius = Math.abs(Math.max(width, height) / 2);
      shape = {
        type: "circle",
        centerX: this.startX + radius,
        centerY: this.startY + radius,
        radius,
      };
    }

    if (!shape) return;
    this.existingShapes.push(shape);
    this.clearCanvas();

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // --- Moving shape ---
    if (this.selectedTool === "move" && this.isMoving && this.selectedShapeIndex !== null) {
      const shape = this.existingShapes[this.selectedShapeIndex];
      if (shape.type === "rect") {
        shape.x = x - this.moveOffsetX;
        shape.y = y - this.moveOffsetY;
      } else if (shape.type === "circle") {
        shape.centerX = x - this.moveOffsetX;
        shape.centerY = y - this.moveOffsetY;
      } else if (shape.type === "text") {
        shape.x = x - this.moveOffsetX;
        shape.y = y - this.moveOffsetY;
      }
      this.clearCanvas();
      return;
    }

    // --- Live preview when drawing ---
    if (!this.clicked || this.selectedTool === "text") return;
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const width = endX - this.startX;
    const height = endY - this.startY;

    this.clearCanvas();
    this.ctx.strokeStyle = this.darkMode ? "#ffffff" : "#000000";
    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const radius = Math.abs(Math.max(width, height) / 2);
      const centerX = this.startX + radius;
      const centerY = this.startY + radius;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  // --- Register events ---
  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("mousedown", this.mouseDownForMove);
    this.canvas.addEventListener("contextmenu", this.handleRightClick);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  // --- Delete with right-click or Delete key ---
  private handleRightClick = (e: MouseEvent) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const idx = this.findShapeAt(x, y);
    if (idx !== null) this.deleteShape(idx);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Delete" && this.selectedShapeIndex !== null) {
      this.deleteShape(this.selectedShapeIndex);
      this.selectedShapeIndex = null;
    }
  };

  private deleteShape(index: number) {
    const shape = this.existingShapes[index];
    this.existingShapes.splice(index, 1);
    this.clearCanvas();

    this.socket.send(
      JSON.stringify({
        type: "delete",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  }

  // --- Shape detection & text ---
  private findShapeAt(x: number, y: number, buffer = 8): number | null {
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const s = this.existingShapes[i];
      if (s.type === "rect") {
        if (
          x >= s.x - buffer &&
          x <= s.x + s.width + buffer &&
          y >= s.y - buffer &&
          y <= s.y + s.height + buffer
        )
          return i;
      } else if (s.type === "circle") {
        const dx = x - s.centerX;
        const dy = y - s.centerY;
        if (Math.sqrt(dx * dx + dy * dy) <= s.radius + buffer) return i;
      } else if (s.type === "text") {
        const w = this.ctx.measureText(s.value).width;
        if (
          x >= s.x - buffer &&
          x <= s.x + w + buffer &&
          y >= s.y - buffer &&
          y <= s.y + 20 + buffer
        )
          return i;
      }
    }
    return null;
  }

  private addText(x: number, y: number) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type...";
    input.style.position = "absolute";
    input.style.background = "transparent";
    input.style.border = "1px solid gray";
    input.style.color = this.darkMode ? "white" : "black";
    input.style.font = "16px sans-serif";
    input.style.zIndex = "1000";
    const rect = this.canvas.getBoundingClientRect();
    input.style.left = `${rect.left + x}px`;
    input.style.top = `${rect.top + y}px`;
    document.body.appendChild(input);
    input.focus();

    const cleanup = () => input.remove();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = input.value.trim();
        if (val) {
          const shape: Shape = { type: "text", x, y, value: val };
          this.existingShapes.push(shape);
          this.clearCanvas();
          this.socket.send(
            JSON.stringify({
              type: "chat",
              message: JSON.stringify({ shape }),
              roomId: this.roomId,
            })
          );
        }
        cleanup();
      } else if (e.key === "Escape") cleanup();
    });
    input.addEventListener("blur", cleanup);
  }

  // --- Shape equality (for delete) ---
  private isSameShape(a: Shape, b: Shape): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
