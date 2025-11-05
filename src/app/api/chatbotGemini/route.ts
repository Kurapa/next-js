import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, userProfile } = await req.json();
  const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
  if (!API_KEY) return NextResponse.json({ error: "API key missing" }, { status: 500 });

  // Use the new flash model
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${API_KEY}`;

  const prompt = `
You are an expert farming assistant AI. Answer agricultural questions with the latest recommendations and advice.
User profile info: ${JSON.stringify(userProfile)}
User question: ${message}
`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no answer!";
    return NextResponse.json({ text: answer });
  } catch (error) {
    return NextResponse.json({ error: "Gemini API error" }, { status: 500 });
  }
}
