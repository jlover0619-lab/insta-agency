import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not set" }, { status: 500 });
  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });
  if (!response.ok) return NextResponse.json({ error: "Failed" }, { status: response.status });
  const data = await response.json();
  const clonedVoices = data.voices.filter((v: { category: string }) => v.category === "cloned");
  return NextResponse.json({ voices: clonedVoices });
}
