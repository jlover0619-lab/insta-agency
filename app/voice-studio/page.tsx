"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Voice {
  voice_id: string;
  name: string;
}

type Tab = "register" | "generate";
type RecordState = "idle" | "recording" | "recorded";

export default function VoiceStudioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("register");
  const [voiceName, setVoiceName] = useState("");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [recordings, setRecordings] = useState<{ blob: Blob; url: string; name: string }[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);
  const [cloneError, setCloneError] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [text, setText] = useState("");
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [genError, setGenError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { fetchVoices(); }, []);

  async function fetchVoices() {
    try {
      const res = await fetch("/api/elevenlabs/voices");
      const data = await res.json();
      if (data.voices) setVoices(data.voices);
    } catch {}
  }

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#D4AF37";
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      drawWaveform();
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const name = `녹음_${recordings.length + 1}.webm`;
        setRecordings((prev) => [...prev, { blob, url, name }]);
        setRecordState("recorded");
        cancelAnimationFrame(animFrameRef.current);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecordState("recording");
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      alert("마이크 접근 권한이 필요합니다.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function removeRecording(idx: number) {
    setRecordings((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleClone() {
    if (!voiceName.trim()) return alert("목소리 이름을 입력하세요.");
    if (recordings.length === 0) return alert("최소 1개 이상 녹음해주세요.");
    setIsCloning(true); setCloneError("");
    try {
      const fd = new FormData();
      fd.append("name", voiceName);
      recordings.forEach((r, i) => fd.append("files", r.blob, `sample_${i}.webm`));
      const res = await fetch("/api/elevenlabs/clone", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCloneSuccess(true);
      await fetchVoices();
      setSelectedVoiceId(data.voiceId);
    } catch (e: unknown) {
      setCloneError(e instanceof Error ? e.message : "클론 생성 실패");
    } finally { setIsCloning(false); }
  }

  async function handleGenerate() {
    if (!selectedVoiceId) return alert("목소리를 선택하세요.");
    if (!text.trim()) return alert("텍스트를 입력하세요.");
    setIsGenerating(true); setGenError(""); setAudioUrl("");
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
    } finally { setIsGenerating(false); }
  }

  function downloadAudio() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${text.slice(0, 20).replace(/\s/g, "_")}_voice.mp3`;
    a.click();
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

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
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">내 목소리로 <span className="gold-gradient-text">AI 음성</span> 만들기</h1>
          <p className="text-[#888] text-sm">목소리를 녹음하면 AI가 학습해서, 어떤 글이든 내 목소리로 읽어드려요.</p>
        </div>
        <div className="flex gap-1 p-1 bg-[#111] rounded-xl border border-[#222] mb-8">
          {([{id:"register" as Tab,label:"① 내 목소리 등록",icon:"🎙️"},{id:"generate" as Tab,label:"② 음성 생성",icon:"✨"}]).map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${activeTab===t.id?"gold-gradient-bg text-black":"text-[#666] hover:text-white"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {activeTab==="register" && (
          <div className="space-y-6">
            <div className="card-dark rounded-2xl p-6">
              <label className="block text-sm text-[#888] mb-2">목소리 이름</label>
              <input className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="예: 내 목소리, 릴스 보이스..." value={voiceName} onChange={e=>setVoiceName(e.target.value)} />
            </div>
            <div className="card-dark rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div><h2 className="font-semibold">목소리 샘플 녹음</h2><p className="text-xs text-[#666] mt-1">30초~1분 자연스럽게 읽어주세요</p></div>
                <span className="text-xs bg-[#222] px-3 py-1 rounded-full text-[#888]">{recordings.length}개</span>
              </div>
              <canvas ref={canvasRef} width={600} height={80} className={`w-full rounded-lg bg-[#111] ${recordState!=="recording"?"opacity-30":""}`} />
              <div>
                {recordState!=="recording" ? (
                  <button onClick={startRecording} className="flex items-center gap-2 gold-gradient-bg text-black font-semibold px-6 py-3 rounded-xl">
                    <span className="w-3 h-3 rounded-full bg-black inline-block"/>녹음 시작
                  </button>
                ) : (
                  <button onClick={stopRecording} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-xl animate-pulse">
                    <span className="w-3 h-3 rounded-sm bg-white inline-block"/>녹음 중지 {fmt(recordingTime)}
                  </button>
                )}
              </div>
              {recordings.length>0 && (
                <div className="space-y-2">
                  {recordings.map((r,i)=>(
                    <div key={i} className="flex items-center gap-3 bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3">
                      <span className="text-[#D4AF37] text-sm font-mono w-6">{i+1}</span>
                      <audio src={r.url} controls className="flex-1 h-8"/>
                      <button onClick={()=>removeRecording(i)} className="text-[#555] hover:text-red-400 text-lg">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 text-sm">
              <p className="text-[#888] font-medium mb-1">💡 추천 샘플 텍스트</p>
              <p className="text-[#555]">&quot;안녕하세요, 오늘은 제가 좋아하는 카페를 소개할게요. 여기는 분위기도 좋고 커피도 정말 맛있어요. 꼭 한번 방문해보세요!&quot;</p>
            </div>
            {cloneSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="text-4xl">🎉</div>
                <p className="font-semibold text-[#D4AF37]">목소리 클론 완성!</p>
                <button onClick={()=>setActiveTab("generate")} className="gold-gradient-bg text-black font-semibold px-8 py-3 rounded-xl">음성 생성하러 가기 →</button>
              </div>
            ) : (
              <button onClick={handleClone} disabled={isCloning||recordings.length===0}
                className="w-full py-4 gold-gradient-bg text-black font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
                {isCloning?"AI가 학습 중...":"✨ 내 목소리로 AI 클론 만들기"}
              </button>
            )}
            {cloneError&&<p className="text-red-400 text-sm text-center">{cloneError}</p>}
          </div>
        )}
        {activeTab==="generate" && (
          <div className="space-y-6">
            <div className="card-dark rounded-2xl p-6">
              <label className="block text-sm text-[#888] mb-2">목소리 선택</label>
              {voices.length===0 ? (
                <div className="text-center py-8 text-[#555]">
                  <p className="text-3xl mb-2">🎙️</p>
                  <p className="text-sm">먼저 목소리 등록 탭에서 목소리를 만들어주세요.</p>
                  <button onClick={()=>setActiveTab("register")} className="mt-3 text-[#D4AF37] text-sm underline">등록하러 가기</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {voices.map(v=>(
                    <button key={v.voice_id} onClick={()=>setSelectedVoiceId(v.voice_id)}
                      className={`px-4 py-3 rounded-xl border text-left transition-all ${selectedVoiceId===v.voice_id?"border-[#D4AF37] bg-[#D4AF3710] text-[#D4AF37]":"border-[#222] text-[#888] hover:border-[#444]"}`}>
                      <div className="flex items-center gap-2">
                        <span>{selectedVoiceId===v.voice_id?"✅":"🎤"}</span>
                        <span className="font-medium text-sm">{v.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="card-dark rounded-2xl p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-[#888]">읽을 텍스트</label>
                  <span className="text-xs text-[#555]">{text.length}/2500</span>
                </div>
                <textarea className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#D4AF37] resize-none"
                  rows={6} maxLength={2500} placeholder="여기에 텍스트를 입력하면 내 목소리로 읽어드려요."
                  value={text} onChange={e=>setText(e.target.value)}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-[#666] mb-1"><span>안정성</span><span className="text-[#D4AF37]">{Math.round(stability*100)}%</span></div>
                  <input type="range" min={0} max={1} step={0.01} value={stability} onChange={e=>setStability(parseFloat(e.target.value))} className="w-full accent-[#D4AF37]"/>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[#666] mb-1"><span>유사도</span><span className="text-[#D4AF37]">{Math.round(similarityBoost*100)}%</span></div>
                  <input type="range" min={0} max={1} step={0.01} value={similarityBoost} onChange={e=>setSimilarityBoost(parseFloat(e.target.value))} className="w-full accent-[#D4AF37]"/>
                </div>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={isGenerating||!selectedVoiceId||!text.trim()}
              className="w-full py-4 gold-gradient-bg text-black font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
              {isGenerating?"내 목소리로 변환 중...":"🎵 내 목소리로 음성 생성"}
            </button>
            {genError&&<p className="text-red-400 text-sm text-center">{genError}</p>}
            {audioUrl&&(
              <div className="card-dark rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2"><span className="text-2xl">🎉</span><h3 className="font-semibold">음성 생성 완료!</h3></div>
                <audio src={audioUrl} controls className="w-full"/>
                <button onClick={downloadAudio} className="w-full py-3 border border-[#D4AF37] text-[#D4AF37] font-semibold rounded-xl hover:bg-[#D4AF3710]">⬇️ MP3 다운로드</button>
              </div>
            )}
          </div>
        )}
        <div className="mt-12 p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl text-xs text-[#444]">
          <p className="text-[#555] font-medium mb-1">⚙️ 개발자 설정</p>
          <p>Vercel에서 <code className="text-[#D4AF37]">ELEVENLABS_API_KEY</code> 환경변수를 설정하세요.</p>
        </div>
      </main>
    </div>
  );
}
