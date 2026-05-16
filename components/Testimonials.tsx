import FadeIn from "./FadeIn";

const testimonials = [
  {
    name: "김지영",
    role: "네일샵 운영 · 강남구",
    text: "처음엔 반신반의했는데 3개월 만에 팔로워가 10배 넘게 늘었어요. 실제로 인스타 보고 예약하는 분들이 생겼습니다.",
    result: "120명 → 2,400명",
  },
  {
    name: "박민준",
    role: "카페 사장 · 홍대",
    text: "혼자서 인스타 운영하려니 뭘 올려야 할지 몰랐는데, 맡기고 나서 신경 쓸 게 없어졌어요. 손님도 확실히 늘었습니다.",
    result: "신규 방문 고객 월 40% 증가",
  },
  {
    name: "이수진",
    role: "분식집 운영 · 마포구",
    text: "릴스 올리고 나서 동네에서 유명해진 것 같아요. 배달 주문이 인스타 통해서 오는 게 확실히 느껴집니다.",
    result: "배달 주문 2배 증가",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-[#080808]">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[#D4AF37] text-xs sm:text-sm font-medium tracking-widest uppercase mb-3">
              Reviews
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              고객 후기
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">직접 운영을 맡겨보신 사장님들의 이야기</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 120}>
              <div className="card-dark rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 flex flex-col h-full hover:border-[#D4AF37]/30 transition-colors duration-300">
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="text-[#D4AF37] text-xs sm:text-sm">★</span>
                  ))}
                </div>

                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="px-3 py-2 rounded-lg sm:rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] text-xs sm:text-sm font-medium mb-4 sm:mb-5">
                  📈 {t.result}
                </div>

                <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-[#1E1E1E]">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full gold-gradient-bg flex items-center justify-center text-black font-bold text-xs sm:text-sm flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white text-xs sm:text-sm font-medium">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
