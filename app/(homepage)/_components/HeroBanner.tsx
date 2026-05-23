"use client"

import React, { useRef } from 'react'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, SplitText);

const HeroBanner = () => {

    const textRef = useRef<HTMLHeadingElement>(null);

    useGSAP(() => {
        if (!textRef.current) return;

        SplitText.create(textRef.current, {
            type: "words, chars",
            autoSplit: true,

            // Áp dụng class Tailwind nếu muốn
            charsClass: "inline-block",

            // Trả về animation GSAP trong onSplit để tự động re-split khi cần thiết
            onSplit: function (self) {
                return gsap.from(self.chars, {
                    y: 5,
                    opacity: 0,
                    stagger: 0.05,
                    duration: 1.05
                });
            }
        });
    }, { scope: textRef }); // Đặt scope để GSAP giới hạn phạm vi tìm kiếm element (tùy chọn nhưng tốt cho hiệu suất)

    
    return (
        <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#050a16] px-4 text-white">
            <video
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
            >
                <source src="/video/homepage-bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
            <div className="relative z-10 w-full max-w-3xl p-8 text-center sm:p-12">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                    Minimal Interior Design
                </p>
                <h1 ref={textRef} className="text-4xl font-bold leading-tight sm:text-5xl">
                    We minimize your waste in every step of the process.
                </h1>
            </div>
        </div>
    )
}

export default HeroBanner
