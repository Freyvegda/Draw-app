"use client";

import React from "react";
import { RoomCanvas } from "@/components/RoomCanvas";

interface CanvasPageProps {
  params: Promise<{ roomId: string }>;
}

export default function CanvasPage({ params }: CanvasPageProps) {
  // Use React.use() to unwrap the Promise
  const { roomId } = React.use(params);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  return <RoomCanvas roomId={roomId} token={token} />;
}
