"use client";

import { useState } from "react";

const KOREAN_VOICES = [
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica - 자연스러운 한국어" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah - 부드러운 여성" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam - 친근한 남성" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily - 밝은 여성" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel - 안정적인 남성" },
];

export default function VoiceStudioPage() {
  const [selectedVoiceId, setSelectedVoiceId] = useState(KOREAN_VOICES[0].id);
  const [text, setText] = useState("");
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [genError, setGenError] = useState("");

  async function handleGenerate() {
    if (!text.trim()) return alert("텍스트를 입력하세요.");
    setIsGenerating(true);
    setGenError("");
    setAudioUrl("");
    try {
      const res = await fetch("/api/elevenlabs/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId: selectedVoiceId, text, stability, similarityBoost }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setAudioUrl(URL.createObjectURL(await res.blob()));
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : "음성 생성 실패");
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadAudio() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${text.slice(0, 20).replace(/\s/g, "_")}_voice.mp3`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-[#222] px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-sm text-[#888] hover:text-[#D4AF37] transition-colors">← 메인으로</a>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gold-gradient-bg flex items-center justify-center text-black font-bold text-sm">V</div>
          <span className="font-bold text-lg">Voice Studio</span>
        </div>
        <div className="text-xs text-[#555] hidden sm:block">Powered by ElevenLabs</div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            텍스트를 <span className="gold-gradient-text">AI 음성</span>으로
          </h1>
          <p className="text-[#888] text-sm">목소리를 선택하고 텍스트를 입력하면 MP3로 변환해드려요.</p>
        </div>

        <div className="space-y-6">
          {/* 목소리 선택 */}
          <div className="card-dark rounded-2xl p-6">
            <label className="block text-sm text-[#888] mb-3">🎤 목소리 선택</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {KOREAN_VOICES.map((v) => (
                <button key={v.id} onClick={() => setSelectedVoiceId(v.id)}
                  className={`px-4 py-3 rounded-xl border text-left transition-all ${
                    selectedVoiceId === v.id
                      ? "border-[#D4AF37] bg-[#D4AF3710] text-[#D4AF37]"
                      : "border-[#222] text-[#888] hover:border-[#444]"
                  }`}>
                  <div className="flex items-center gap-2">
                    <span>{selectedVoiceId === v.id ? "✅" : "🎙️"}</span>
                    <span className="font-medium text-sm">{v.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 텍스트 입력 */}
          <div className="card-dark rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-[#888]">읽을 텍스트 입력</label>
                <span className="text-xs text-[#555]">{text.length}/2500</span>
              </div>
              <textarea
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                rows={6} maxLength={2500}
                placeholder="여기에 텍스트를 입력하면 AI 목소리로 읽어드려요.&#10;&#10;예: 안녕하세요! 오늘은 제가 추천하는 맛집을 소개해드릴게요..."
                value={text} onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-[#666] mb-1">
                  <span>안정성</span><span className="text-[#D4AF37]">{Math.round(stability * 100)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))} className="w-full accent-[#D4AF37]" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#666] mb-1">
                  <span>유사도</span><span className="text-[#D4AF37]">{Math.round(similarityBoost * 100)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={similarityBoost}
                  onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))} className="w-full accent-[#D4AF37]" />
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || !text.trim()}
            className="w-full py-4 gold-gradient-bg text-black font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
            {isGenerating ? "변환 중..." : "🎵 AI 음성으로 변환"}
          </button>
          {genError && <p className="text-red-400 text-sm text-center">{genError}</p>}

          {audioUrl && (
            <div className="card-dark rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <h3 className="font-semibold">음성 생성 완료!</h3>
              </div>
              <audio src={audioUrl} controls className="w-full" />
              <button onClick={downloadAudio}
                className="w-full py-3 border border-[#D4AF37] text-[#D4AF37] font-semibold rounded-xl hover:bg-[#D4AF3710]">
                ⬇️ MP3 다운로드
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
