import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { COLOR, PROFILE } from "../intro/IntroPage";
import { t } from "i18next";
function Marquee() {
  const { t } = useTranslation();
  const items = t("marquee.items", {
    returnObjects: true,
  }) as unknown as string[];
  const track = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="relative flex overflow-hidden border-t border-neutral-100 py-4">
      <div className="animate-intro-marquee flex shrink-0 items-center gap-10 whitespace-nowrap pr-10 motion-reduce:animate-none">
        {track.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-[11px] uppercase tracking-[0.24em] text-neutral-400"
          >
            {item}
            <span
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: COLOR.line }}
            />
          </span>
        ))}
      </div>
      {/* 양쪽 페이드 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

interface FooterType {
  ready: boolean;
}
export const Footer = (ready: FooterType) => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-0 z-40 bg-white/85 backdrop-blur-md"
    >
      <Marquee />
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 md:px-10">
        <p className="text-[10px] tracking-[0.14em] text-neutral-400">
          © {PROFILE.year} {PROFILE.name}
        </p>

        {/* 스크롤 인디케이터 */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] uppercase tracking-[0.24em] text-neutral-400">
            {t("cta.scroll")}
          </span>
          <span className="relative flex h-6 w-4 items-start justify-center rounded-full border border-neutral-200 pt-1">
            <span className="animate-intro-scroll-dot h-1 w-1 rounded-full bg-neutral-400" />
          </span>
        </div>
      </div>
    </motion.footer>
  );
};
