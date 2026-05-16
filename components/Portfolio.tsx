import FadeIn from "./FadeIn";
import StatCounter from "./StatCounter";

const stats = [
  { num: 50, suffix: "+", label: "운영 계정", sub: "다양한 업종 경험" },
  { num: 3000, suffix: "+", label: "평균 팔로워 증가", sub: "3개월 기준", format: true },
  { num: 90, suffix: "%", label: "고객 재계약률", sub: "장기 파트너십" },
  { num: 2, suffix: "년+", label: "운영 경험", sub: "검증된 노하우" },
];

const cases = [
  {
    type: "음식점",
    before: "320명",
    after: "4,800명",
    period: "6개월",
    highlight: "로컬 맛집 포지셔닝으로 예약 문의 3배 증가",
  },
  {
    type: "네일 샵",
    before: "150명",
    after: "2,900명",
    period: "5개월",
    highlight: "시술 후기 콘텐츠 전략으로 신규 방문 고객 꾸준히 증가",
  },
  {
    type: "카페",
    before: "580명",
    after: "6,200명",
    period: "7개월",
    highlight: "감성 피드 리브랜딩 후 게시물 평균 도달률 500% 상승",
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-16 md:py-24 px-4 sm:px-6 bg-[#080808]">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[#D4AF37] text-xs sm:text-sm font-medium tracking-widest uppercase mb-3">
              Results
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              숫자로 보는 실적
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              말이 아닌 결과로 증명합니다
            </p>
          </div>
        </FadeIn>

        {/* 카운터 애니메이션 통계 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12 md:mb-16">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 80}>
              <div className="text-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 h-full">
                <StatCounter
                  target={stat.num}
                  suffix={stat.suffix}
                  format={stat.format}
                />
                <div className="text-white font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">{stat.label}</div>
                <div className="text-gray-500 text-xs">{stat.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* 운영 사례 */}
        <FadeIn>
          <h3 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-center">
            운영 사례
          </h3>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cases.map((c, i) => (
            <FadeIn key={c.type} delay={i * 100}>
              <div className="card-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-[#D4AF37]/30 transition-colors duration-300 h-full">
                <div className="inline-block px-2.5 sm:px-3 py-1 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-xs mb-4 sm:mb-5">
                  {c.type}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                  <div className="text-center flex-shrink-0">
                    <div className="text-gray-500 text-xs mb-0.5 sm:mb-1">시작</div>
                    <div className="text-base sm:text-lg font-semibold text-gray-300">{c.before}</div>
                  </div>

                  <div className="flex-1 flex items-center gap-1 min-w-0">
                    <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/30 to-[#D4AF37]" />
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>

                  <div className="text-center flex-shrink-0">
                    <div className="text-gray-500 text-xs mb-0.5 sm:mb-1">{c.period} 후</div>
                    <div className="text-base sm:text-lg font-bold gold-gradient-text">{c.after}</div>
                  </div>
                </div>

                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{c.highlight}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 sm:mt-8">
          * 위 사례는 실제 운영 계정을 기반으로 하며, 결과는 업종·초기 상태·운영 기간에 따라 다를 수 있습니다.
        </p>
      </div>
    </section>
  );
}
