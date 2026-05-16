export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1A1A1A] py-8 md:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
        <div>
          <div className="font-[family-name:var(--font-playfair)] text-lg font-bold gold-gradient-text mb-1">
            GLOW STUDIO
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">인스타그램 계정 운영 대행 전문</p>
        </div>

        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
          <a href="#services" className="hover:text-[#D4AF37] transition-colors py-1">서비스</a>
          <a href="#portfolio" className="hover:text-[#D4AF37] transition-colors py-1">실적</a>
          <a href="#notice" className="hover:text-[#D4AF37] transition-colors py-1">공지</a>
          <a href="#contact" className="hover:text-[#D4AF37] transition-colors py-1">문의</a>
        </nav>

        <p className="text-gray-600 text-xs sm:text-sm">© {year} GLOW STUDIO. All rights reserved.</p>
      </div>
    </footer>
  );
}
