export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#D4AF37]/5 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#D4AF37]/4 rounded-full blur-[70px] sm:blur-[100px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl w-full mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-xs sm:text-sm mb-8 sm:mb-10">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D4AF37] animate-pulse flex-shrink-0" />
          소규모 자영업 전문 인스타그램 대행
        </div>

        {/* Headline */}
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-5 sm:mb-6">
          인스타그램,
          <br />
          <span className="gold-gradient-text">전문가에게</span>
          <br />
          맡기세요
        </h1>

        <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          바쁜 사장님을 위해 인스타그램 계정을 처음부터 끝까지 대신 운영해 드립니다.
          <br className="hidden sm:block" />
          <span className="text-white">팔로워 증가 · 브랜드 인지도 상승 · 매출 연결</span>
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href="#contact"
            className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-black gold-gradient-bg rounded-full hover:opacity-90 transition-opacity"
          >
            무료 상담 신청 →
          </a>
          <a
            href="#portfolio"
            className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-medium text-[#D4AF37] border border-[#D4AF37]/40 rounded-full hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all"
          >
            실적 보기
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-[#1E1E1E] flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-3 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#D4AF37]">✓</span>
            장기 계약 없음 · 월 단위 운영
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#D4AF37]">✓</span>
            월 1회 성과 리포트 제공
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#D4AF37]">✓</span>
            첫 달 성과 보장
          </span>
        </div>
      </div>

      {/* 스크롤 유도 인디케이터 */}
      <a
        href="#services"
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 hover:text-[#D4AF37] transition-colors duration-300 group"
        aria-label="아래로 스크롤"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase hidden sm:block">Scroll</span>
        <div className="relative w-5 h-8 rounded-full border border-gray-700 group-hover:border-[#D4AF37] transition-colors duration-300 flex justify-center pt-1.5">
          <div className="w-1 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#D4AF37] scroll-dot transition-colors duration-300" />
        </div>
      </a>
    </section>
  );
}
