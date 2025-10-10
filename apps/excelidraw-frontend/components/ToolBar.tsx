import { Circle, Pencil, RectangleHorizontal, Type, Move, Trash2 } from "lucide-react";
import IconButton from "./IconButton";

export type Tool = "circle" | "rect" | "pencil" | "text" | "move"| "delete";

export function Toolbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div className="fixed top-5 left-5 z-30">
      <div className="flex flex-col gap-2">
        <IconButton
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
          onClick={() => setSelectedTool("pencil")}
          title="Pencil"
        />
        <IconButton
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontal />}
          onClick={() => setSelectedTool("rect")}
          title="Rectangle"
        />
        <IconButton
          activated={selectedTool === "circle"}
          icon={<Circle />}
          onClick={() => setSelectedTool("circle")}
          title="Circle"
        />
        <IconButton
          activated={selectedTool === "text"}
          icon={<Type />}
          onClick={() => setSelectedTool("text")}
          title="Text"
        />
        <IconButton
          activated={selectedTool === "move"}
          icon={<Move />}
          onClick={() => setSelectedTool("move")}
          title="Move Shape"
        />
        <IconButton
          activated={selectedTool === "delete"}
          icon={<Trash2 />}
          onClick={() => setSelectedTool("delete")}
          title="Delete Shape"
        />
      </div>
    </div>
  );
}
