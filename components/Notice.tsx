"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";

type Category = "공지" | "이벤트" | "후기";

interface NoticeItem {
  id: number;
  category: Category;
  title: string;
  date: string;
  content: string;
}

// ✏️ 새 공지를 추가하려면 이 배열 맨 앞에 항목을 추가하세요
const notices: NoticeItem[] = [
  {
    id: 1,
    category: "이벤트",
    title: "첫 달 50% 할인 이벤트 진행 중",
    date: "2025.05.16",
    content:
      "5월 한 달간 신규 계약 고객님께 첫 달 운영 비용 50% 할인 혜택을 드립니다.\n\n지금 바로 문의해 주시면 할인 적용해 드립니다. 선착순 5명 한정이니 서두르세요!",
  },
  {
    id: 2,
    category: "공지",
    title: "릴스 전문 패키지 새롭게 출시",
    date: "2025.05.10",
    content:
      "최근 인스타그램 알고리즘이 릴스(Reels) 위주로 변경됨에 따라, 릴스 기획·편집·업로드에 특화된 전문 패키지를 출시했습니다.\n\n기존 피드 운영과 병행하거나 릴스 단독으로도 신청 가능합니다. 자세한 내용은 문의 주세요.",
  },
  {
    id: 3,
    category: "후기",
    title: "○○카페 6개월 운영 결과 공유",
    date: "2025.04.28",
    content:
      "홍대 소재 카페를 6개월간 운영 대행한 결과를 공유합니다.\n\n• 팔로워: 580명 → 6,200명\n• 게시물 평균 도달률: 500% 상승\n• 인스타 유입 신규 고객: 월 평균 40명 이상\n\n꾸준한 피드 기획과 릴스 업로드가 큰 효과를 발휘했습니다.",
  },
  {
    id: 4,
    category: "공지",
    title: "5월 신규 모집 마감 안내",
    date: "2025.04.20",
    content:
      "5월 신규 계약 가능 슬롯이 2자리 남았습니다.\n\n운영 품질 유지를 위해 동시에 받는 계정 수를 제한하고 있습니다. 관심 있으신 분들은 빠르게 문의 부탁드립니다.",
  },
];

const categoryStyle: Record<Category, string> = {
  공지: "border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10",
  이벤트: "border-[#E879F9]/40 text-[#E879F9] bg-[#E879F9]/10",
  후기: "border-[#34D399]/40 text-[#34D399] bg-[#34D399]/10",
};

export default function Notice() {
  const [openId, setOpenId] = useState<number | null>(null);
  const toggle = (id: number) => setOpenId(openId === id ? null : id);

  return (
    <section id="notice" className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[#D4AF37] text-xs sm:text-sm font-medium tracking-widest uppercase mb-3">
              Notice
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              공지사항
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              서비스 관련 최신 소식을 확인하세요
            </p>
          </div>
        </FadeIn>

        <div className="space-y-2 sm:space-y-3">
          {notices.map((notice, i) => (
            <FadeIn key={notice.id} delay={i * 60}>
              <div
                className={`card-dark rounded-xl sm:rounded-2xl overflow-hidden transition-colors duration-300 ${
                  openId === notice.id ? "border-[#D4AF37]/30" : "hover:border-[#2A2A2A]"
                }`}
              >
                {/* 제목 행 */}
                <button
                  onClick={() => toggle(notice.id)}
                  className="w-full flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left min-h-[60px]"
                >
                  <span
                    className={`flex-shrink-0 px-2 sm:px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                      categoryStyle[notice.category]
                    }`}
                  >
                    {notice.category}
                  </span>

                  <span className="flex-1 text-xs sm:text-sm md:text-base font-medium text-white line-clamp-1">
                    {notice.title}
                  </span>

                  <span className="flex-shrink-0 text-gray-600 text-xs hidden sm:block">
                    {notice.date}
                  </span>

                  <span
                    className={`flex-shrink-0 text-gray-500 transition-transform duration-300 ${
                      openId === notice.id ? "rotate-180" : ""
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {/* 펼쳐지는 내용 */}
                <div
                  className={`transition-all duration-300 ease-out overflow-hidden ${
                    openId === notice.id ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-[#1A1A1A]">
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed whitespace-pre-line pt-3 sm:pt-4">
                      {notice.content}
                    </p>
                    <p className="text-gray-600 text-xs mt-3 sm:mt-4">{notice.date}</p>
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
