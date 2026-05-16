"use client";

import { useState, useEffect } from "react";

const navLinks = [
  { href: "#services", label: "서비스", id: "services" },
  { href: "#portfolio", label: "실적", id: "portfolio" },
  { href: "#notice", label: "공지", id: "notice" },
  { href: "#contact", label: "문의", id: "contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 현재 보이는 섹션 감지
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -50% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // 모바일 메뉴 열렸을 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/95 backdrop-blur-sm border-b border-[#D4AF37]/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <a
            href="#"
            className="text-xl font-[family-name:var(--font-playfair)] font-bold gold-gradient-text"
          >
            GLOW STUDIO
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map(({ href, label, id }) => (
              <a
                key={id}
                href={href}
                className={`transition-colors duration-200 ${
                  activeSection === id
                    ? "text-[#D4AF37]"
                    : "text-gray-400 hover:text-[#D4AF37]"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="hidden md:block px-6 py-2.5 text-sm font-semibold text-black gold-gradient-bg rounded-full hover:opacity-90 transition-opacity"
          >
            무료 상담 신청
          </a>

          <button
            className="md:hidden flex flex-col gap-1.5 p-1 relative z-50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
          >
            <span
              className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${
                menuOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* 모바일 배경 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* 모바일 슬라이드 메뉴 */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-40 w-72 bg-[#0D0D0D] border-l border-[#222222] flex flex-col pt-24 px-8 gap-2 transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {navLinks.map(({ href, label, id }) => (
          <a
            key={id}
            href={href}
            className={`py-3 text-lg font-medium border-b border-[#1A1A1A] transition-colors ${
              activeSection === id
                ? "text-[#D4AF37]"
                : "text-gray-300 hover:text-[#D4AF37]"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}
        <a
          href="#contact"
          className="mt-6 px-6 py-3 font-semibold text-black gold-gradient-bg rounded-full text-center"
          onClick={() => setMenuOpen(false)}
        >
          무료 상담 신청
        </a>
      </div>
    </>
  );
}
