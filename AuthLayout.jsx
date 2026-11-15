import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { BRAND_LOGO } from "@/lib/brand";

const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 96}%`,
  size: i % 6 === 0 ? 2 : 1,
  delay: `${(i % 9) * 0.7}s`,
  opacity: 0.18 + ((i * 13) % 55) / 100,
}));

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {STARS.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-pulse-soft"
            style={{
              left: star.left,
              top: star.top,
              height: star.size,
              width: star.size,
              opacity: star.opacity,
              animationDelay: star.delay,
            }}
          />
        ))}
        <div className="absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(74,158,255,0.18),transparent_72%)]" />
        <div className="absolute -bottom-[38%] left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(42,126,255,0.24),rgba(42,126,255,0.06),transparent)] blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[430px]"
      >
        <div className="mb-7 flex justify-center">
          <div className="h-[76px] w-[286px] max-w-full">
            <Image
              src={BRAND_LOGO}
              alt="AstroVital"
              fittingType="fit"
              className="h-full w-full object-contain drop-shadow-[0_18px_40px_rgba(11,102,119,0.55)]"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-8">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <p className="mt-5 text-center text-[12px] text-muted-foreground">{footer}</p>}
      </motion.div>
    </div>
  );
}