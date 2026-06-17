import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not set" }, { status: 500 });
  const { voiceId, text, stability, similarityBoost } = await req.json();
  if (!voiceId || !text) return NextResponse.json({ error: "voiceId and text required" }, { status: 400 });
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: stability ?? 0.5, similarity_boost: similarityBoost ?? 0.75 },
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }
  const audioBuffer = await response.arrayBuffer();
  return new NextResponse(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg", "Content-Disposition": "attachment; filename=\"voice_output.mp3\"" },
  });
}
