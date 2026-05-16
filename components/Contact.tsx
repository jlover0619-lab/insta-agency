"use client";

import { useState, FormEvent } from "react";

// TODO: 실제 이메일 주소로 변경하세요
const CONTACT_EMAIL = "your@email.com";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    bizName: "",
    email: "",
    industry: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[대행 문의] ${form.bizName} - ${form.name}`);
    const body = encodeURIComponent(
      [
        `이름: ${form.name}`,
        `업체명: ${form.bizName}`,
        `이메일: ${form.email}`,
        `업종: ${form.industry || "미입력"}`,
        ``,
        `문의 내용:`,
        form.message,
      ].join("\n")
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [field]: e.target.value });

  // text-base(16px) 필수 - iOS에서 포커스 시 자동 확대 방지
  const inputClass =
    "w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-base text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors duration-200";

  return (
    <section id="contact" className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[#D4AF37] text-xs sm:text-sm font-medium tracking-widest uppercase mb-3">
            Contact
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            무료 상담 신청
          </h2>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            궁금한 점이 있으시면 편하게 문의해 주세요.
            <br />
            <span className="text-white">24시간 이내</span> 답변드립니다.
          </p>
        </div>

        {submitted ? (
          <div className="card-dark rounded-2xl p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-5xl mb-4 sm:mb-5">✉️</div>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-semibold mb-2">
              이메일 앱이 열렸습니다!
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-5 sm:mb-6">
              이메일을 전송해 주시면 24시간 이내 연락드리겠습니다.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-[#D4AF37] text-sm hover:underline"
            >
              다시 작성하기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-dark rounded-2xl p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                  이름 <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={update("name")}
                  className={inputClass}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                  업체명 <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.bizName}
                  onChange={update("bizName")}
                  className={inputClass}
                  placeholder="홍길동 카페"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                이메일 <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className={inputClass}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">업종</label>
              <div className="relative">
                <select
                  value={form.industry}
                  onChange={update("industry")}
                  className={inputClass + " appearance-none cursor-pointer pr-10"}
                >
                  <option value="">업종을 선택해 주세요</option>
                  <option value="음식점/카페">음식점 / 카페</option>
                  <option value="뷰티/네일/헤어">뷰티 / 네일 / 헤어</option>
                  <option value="쇼핑몰/패션">쇼핑몰 / 패션</option>
                  <option value="운동/헬스">운동 / 헬스</option>
                  <option value="기타">기타</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">문의 내용</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={update("message")}
                className={inputClass + " resize-none"}
                placeholder="현재 팔로워 수, 원하시는 목표, 예산 등을 자유롭게 적어주세요"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-black gold-gradient-bg rounded-xl hover:opacity-90 transition-opacity"
            >
              무료 상담 신청하기 →
            </button>

            <p className="text-center text-gray-600 text-xs">
              제출 시 기본 이메일 앱이 열립니다. 이메일을 전송해 주시면 됩니다.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
