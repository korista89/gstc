"use client";

import Image from "next/image";

interface PBSTLogoProps {
  className?: string;
  size?: number;
}

export default function PBSTLogo({ className = "", size = 40 }: PBSTLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center bg-white rounded-full overflow-hidden shadow-sm border border-slate-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo/school-logo.png"
        alt="경은학교 로고"
        width={size * 0.8}
        height={size * 0.8}
        className="object-contain"
      />
    </div>
  );
}
