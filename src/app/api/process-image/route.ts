import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(req: Request) {
  const { imageUrl } = await req.json();

  const response = await fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
