import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not set" }, { status: 500 });
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const files = formData.getAll("files") as File[];
  if (!name || files.length === 0) return NextResponse.json({ error: "name and files required" }, { status: 400 });
  const elFormData = new FormData();
  elFormData.append("name", name);
  elFormData.append("description", "Voice clone - Voice Studio");
  for (const file of files) elFormData.append("files", file, file.name);
  const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: elFormData,
  });
  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }
  const data = await response.json();
  return NextResponse.json({ voiceId: data.voice_id, name });
}
