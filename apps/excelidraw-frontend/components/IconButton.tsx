import { ReactNode } from "react";

export default function IconButton({
  icon,
  onClick,
  activated,
  title,
}: {
  icon: ReactNode;
  onClick: () => void;
  activated: boolean;
  title?: string;
}) {
  return (
    <div
      title={title} // native tooltip on hover
      onClick={onClick}
      className={`cursor-pointer rounded-full border p-2 bg-black hover:bg-gray-700 ${
        activated ? "text-red-500" : "text-white"
      }`}
    >
      {icon}
    </div>
  );
}
