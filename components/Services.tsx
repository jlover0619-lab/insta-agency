import FadeIn from "./FadeIn";

const services = [
  {
    num: "01",
    title: "피드 기획 & 전략 수립",
    description:
      "업체 특성에 맞는 피드 테마와 콘텐츠 전략을 기획합니다. 브랜드 아이덴티티에 맞는 일관된 피드를 설계해 첫 방문자도 신뢰감을 갖도록 만듭니다.",
    tags: ["콘텐츠 캘린더", "브랜드 가이드", "경쟁사 분석"],
  },
  {
    num: "02",
    title: "게시물 작성 & 업로드",
    description:
      "매력적인 캡션 작성부터 게시물 업로드까지 전담 처리합니다. 최적의 시간대에 맞춰 정기적으로 업로드해 알고리즘 노출을 극대화합니다.",
    tags: ["캡션 작성", "정기 업로드", "스토리 관리"],
  },
  {
    num: "03",
    title: "해시태그 & 팔로워 관리",
    description:
      "도달률을 극대화하는 해시태그 세팅과 실제 잠재 고객 팔로워 유입을 유도합니다. 댓글 및 DM 초기 응대도 지원합니다.",
    tags: ["해시태그 리서치", "팔로워 유입", "댓글 관리"],
  },
  {
    num: "04",
    title: "성과 분석 & 월간 리포트",
    description:
      "매월 도달률, 팔로워 증가, 게시물 반응을 분석해 리포트로 제공합니다. 데이터 기반으로 전략을 지속 개선해 성장을 가속합니다.",
    tags: ["월간 리포트", "KPI 추적", "전략 개선"],
  },
];

const reasons = [
  {
    label: "자영업 특화",
    desc: "음식점·카페·뷰티 등 소상공인 전문",
    icon: (
      <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    ),
  },
  {
    label: "직접 운영",
    desc: "자동화 없이 담당자가 직접 관리",
    icon: (
      <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    label: "합리적 가격",
    desc: "에이전시 대비 저렴한 비용",
    icon: (
      <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    label: "성과 보장",
    desc: "첫 달 목표 미달 시 환불 보장",
    icon: (
      <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section id="services" className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[#D4AF37] text-xs sm:text-sm font-medium tracking-widest uppercase mb-3">
              Services
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              제공 서비스
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              계정 운영의 모든 과정을 전담합니다
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {services.map((service, i) => (
            <FadeIn key={service.num} delay={i * 100}>
              <div className="card-dark rounded-2xl p-5 sm:p-6 md:p-8 hover:border-[#D4AF37]/40 transition-colors duration-300 group h-full">
                <div className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold gold-gradient-text mb-4 sm:mb-5 leading-none">
                  {service.num}
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-[#D4AF37] transition-colors duration-200">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 sm:px-3 py-1 text-xs rounded-full border border-[#D4AF37]/20 text-[#D4AF37]/70 bg-[#D4AF37]/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Why Us */}
        <FadeIn>
          <div className="mt-12 md:mt-16 border-t border-[#1A1A1A] pt-12 md:pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {reasons.map((item) => (
              <div key={item.label} className="py-3 sm:py-4 px-2 flex flex-col items-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] mb-3 sm:mb-4">
                  {item.icon}
                </div>
                <div className="font-[family-name:var(--font-playfair)] text-base md:text-lg font-semibold gold-gradient-text mb-1.5 sm:mb-2">
                  {item.label}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
