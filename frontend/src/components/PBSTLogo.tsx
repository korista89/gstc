"use client";

import Image from "next/image";

interface PBSTLogoProps {
  className?: string;
  size?: number;
}

export default function PBSTLogo({ className = "", size = 40 }: PBSTLogoProps) {
  return (
    <div 
      className={className}
      style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        width: size, 
        height: size 
      }}
    >
      <Image
        src="/logo/school-logo.png"
        alt="경은학교 로고"
        width={size * 0.8}
        height={size * 0.8}
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
