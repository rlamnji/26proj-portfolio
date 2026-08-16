/**
 * intro.tsx — 포트폴리오 인트로(첫) 페이지
 *
 * 스택: React 18 + TypeScript + Tailwind CSS + framer-motion + react-three-fiber + react-i18next
 *
 * 구성
 *  1) IntroCurtain  : 진입 시 커튼 + 카운터 애니메이션
 *  2) NavBar        : 로고 / 내부 앵커 / 외부 소셜 링크 / 한·영·일 언어 스위처
 *  3) HeroType      : 타이포그래픽 타이틀 (라인별 마스크 리빌)
 *  4) ObjectStage   : 3D 오브제 영역 — mediaSrc(gif/mp4/webp) 주면 이미지로 대체됨
 *  5) Marquee       : 하단 무한 흐름 텍스트
 */

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useTranslation } from "react-i18next";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
//import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import Work from "../work/Work";
import { Footer } from "../component/Footbar";

/* ------------------------------------------------------------------ */
/* 설정 — 이 블록만 바꾸면 개인화 완료                                    */
/* ------------------------------------------------------------------ */

export const PROFILE = {
  name: "KIM MINJI",
  initials: "MJ",
  year: "2026",
} as const;

type SocialKey = "github" | "instagram" | "linkedin" | "email";

export const SOCIALS: ReadonlyArray<{ key: SocialKey; href: string }> = [
  { key: "github", href: "https://github.com/rlamnji" },
  { key: "instagram", href: "https://instagram.com/rlamnji" },
  { key: "linkedin", href: "https://linkedin.com/in/your-handle" },
  { key: "email", href: "mailto:ovo9907@gmail.com" },
];

export const LANGS = [
  { code: "ko", short: "KO" },
  { code: "en", short: "EN" },
  { code: "ja", short: "JA" },
] as const;

/** 절제된 톤: 흰 배경 + 잉크 그레이 + 아주 옅은 세이지 포인트 */
export const COLOR = {
  ink: "#141414",
  muted: "#8C8C86",
  line: "#E6E4DF",
  accent: "#7C8A7E",
  object: "#E9E6E0",
} as const;

/* ------------------------------------------------------------------ */
/* 아이콘                                                              */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };

const ICONS: Record<SocialKey, (p: IconProps) => ReactElement> = {
  github: ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.2 9.2 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  ),
  instagram: ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C21.4 8.75 22 11 22 14.1V21h-4v-6.1c0-1.46-.03-3.34-2.05-3.34-2.05 0-2.36 1.59-2.36 3.24V21h-4V9Z" />
    </svg>
  ),
  email: ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <path d="m3.5 7 7.6 5.4a1.6 1.6 0 0 0 1.8 0L20.5 7" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* 1) 인트로 커튼                                                       */
/* ------------------------------------------------------------------ */

function IntroCurtain({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) {
      onDone();
      return;
    }
    let raf = 0;
    const start = performance.now();
    const DURATION = 1500;

    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 420);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone, reduce]);

  if (reduce) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#7C8A7E] px-6 py-8 md:px-12 md:py-10"
      initial={{ y: 0, opacity: 1 }}
      exit={{ y: "-100%", opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.3em] text-neutral-400">
        <span>{PROFILE.name}</span>
        <span>{t("loader.status")}</span>
      </div>

      <div className="flex items-end justify-between gap-6">
        <span className="shrink-0 font-mono text-2xl tabular-nums text-neutral-900 md:text-4xl">
          {String(count).padStart(3, "0")}
        </span>
      </div>

      <div className="h-px w-full overflow-hidden bg-neutral-200">
        <motion.div
          className="h-full origin-left bg-neutral-900"
          style={{ scaleX: count / 100 }}
        />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 2) 네비게이션 바                                                     */
/* ------------------------------------------------------------------ */

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "ko").split("-")[0];

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={`flex items-center rounded-full border border-neutral-200 p-0.5 ${compact ? "text-[10px]" : "text-[11px]"}`}
    >
      {LANGS.map((lang) => {
        const active = current === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => void i18n.changeLanguage(lang.code)}
            aria-pressed={active}
            className={`relative rounded-full px-2.5 py-1 font-medium tracking-[0.12em] transition-colors duration-300 ${
              active ? "text-white" : "text-neutral-400 hover:text-neutral-900"
            }`}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-neutral-900"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{lang.short}</span>
          </button>
        );
      })}
    </div>
  );
}

function NavBar({ ready }: { ready: boolean }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "border-b border-neutral-100 bg-white/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-5 md:h-20 md:px-10">
        {/* 로고 */}
        <a
          href="#top"
          className="group flex items-center gap-2.5"
          aria-label={PROFILE.name}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold tracking-tight text-white transition-transform duration-500 group-hover:rotate-[20deg]">
            {PROFILE.initials}
          </span>
          <span className="hidden text-[13px] font-medium tracking-[0.18em] text-neutral-900 sm:block">
            {PROFILE.name}
          </span>
        </a>

        {/* 외부 소셜 + 언어 */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ul className="flex items-center gap-0.5 sm:gap-1">
            {SOCIALS.map(({ key, href }) => {
              const Icon = ICONS[key];
              return (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={t(`social.${key}` as const)}
                    title={t(`social.${key}` as const)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-all duration-300 hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
          <span className="hidden h-4 w-px bg-neutral-200 sm:block" />
          <LanguageSwitcher />
        </div>
      </nav>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/* 3) 타이포그래픽 히어로                                                */
/* ------------------------------------------------------------------ */

const lineWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const lineUp: Variants = {
  hidden: { y: "110%", rotate: 3 },
  show: {
    y: "0%",
    rotate: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

function HeroType({ ready }: { ready: boolean }) {
  const { t } = useTranslation();

  const lines = [
    t("hero.titleLine1"),
    t("hero.titleLine2"),
    t("hero.titleLine3"),
  ];

  return (
    <motion.div
      variants={lineWrap}
      initial="hidden"
      animate={ready ? "show" : "hidden"}
      className="flex flex-col"
    >
      {/* 타이포그래픽 타이틀 */}
      <h1 className="select-none font-light leading-[0.86] tracking-[-0.045em] text-neutral-900">
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden py-[0.06em]">
            <motion.span
              variants={lineUp}
              className={`block text-[clamp(2.75rem,11vw,9rem)] ${
                i === 1 ? "italic font-normal" : ""
              }`}
              style={i === 1 ? { color: COLOR.accent } : undefined}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h1>

      {/* 역할 + 설명 */}
      <motion.div variants={fadeUp} className="mt-8 max-w-xl md:mt-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-neutral-300" />
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-neutral-700 md:text-[13px]">
            {t("hero.role")}
          </p>
        </div>
        <p className="text-[14px] leading-relaxed text-neutral-500 md:text-[15px]">
          {t("hero.description")}
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={fadeUp}
        className="mt-9 flex flex-wrap items-center gap-3 md:mt-11"
      >
        <a
          href="#work"
          className="group inline-flex items-center gap-2.5 rounded-full bg-neutral-900 px-6 py-3 text-[13px] font-medium text-white transition-all duration-300 hover:gap-4 hover:bg-neutral-700"
        >
          {t("cta.viewWork")}
          <svg
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden="true"
          >
            <path d="M2 8h12M9 3l5 5-5 5" />
          </svg>
        </a>
        <a
          href="#contact"
          className="inline-flex items-center rounded-full border border-neutral-200 px-6 py-3 text-[13px] font-medium text-neutral-700 transition-colors duration-300 hover:border-neutral-900 hover:text-neutral-900"
        >
          {t("cta.contact")}
        </a>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 4) 3D 오브제 영역                                                    */
/* ------------------------------------------------------------------ */

/*function DistortKnot() {
  const mesh = useRef<Mesh>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    m.rotation.x += delta * 0.12;
    m.rotation.y += delta * 0.18;
    // 마우스 패럴랙스 (부드럽게 따라오기)
    m.position.x += (pointer.x * 0.4 - m.position.x) * 0.04;
    m.position.y += (pointer.y * 0.28 - m.position.y) * 0.04;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.9}>
      <mesh ref={mesh}>
        <torusKnotGeometry args={[1.05, 0.34, 200, 36]} />
        <MeshDistortMaterial
          color={COLOR.object}
          roughness={0.16}
          metalness={0.42}
          distort={0.3}
          speed={1.3}
        />
      </mesh>
    </Float>
  );
}*/

function Scene() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} />
      <directionalLight
        position={[-5, -2, -3]}
        intensity={0.5}
        color="#B9C4BC"
      />
      <pointLight
        position={[0, 0, 4]}
        intensity={12}
        distance={12}
        color="#ffffff"
      />
      {/*<DistortKnot />*/}
    </>
  );
}

/**
 * 3D 오브제 / GIF 영역.
 * - mediaSrc 미지정 → react-three-fiber 3D 오브제 렌더
 * - mediaSrc 지정   → 해당 gif / webp / png 로 대체 (동일 비율 유지)
 */
function ObjectStage({
  ready,
  mediaSrc,
}: {
  ready: boolean;
  mediaSrc?: string;
}) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={ready ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      className="relative aspect-square w-full max-w-[560px] lg:aspect-[4/5] lg:max-w-none"
    >
      {/* 배경 원형 그라데이션 */}
      <div
        className="pointer-events-none absolute inset-[6%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(124,138,126,0.16), rgba(255,255,255,0) 68%)",
        }}
      />

      {/* 얇은 가이드 프레임 — "3D 오브제 영역" 구분선 */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px] border border-dashed"
        style={{ borderColor: COLOR.line }}
      />
      <span className="pointer-events-none absolute left-4 top-4 text-[10px] uppercase tracking-[0.24em] text-neutral-300">
        {t("media.caption")}
      </span>
      <span className="pointer-events-none absolute bottom-4 right-4 text-[10px] tracking-[0.14em] text-neutral-300">
        {t("media.hint")}
      </span>

      {/* ── 실제 컨텐츠 ───────────────────────────────── */}
      {mediaSrc ? (
        <img
          src={mediaSrc}
          alt={t("media.caption")}
          className="absolute inset-0 h-full w-full rounded-[28px] object-contain"
          loading="eager"
        />
      ) : reduce ? (
        // 모션 최소화 설정 시 정적 대체
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-1/2 w-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 30%, #ffffff, ${COLOR.object} 55%, #D3CFC7 100%)`,
            }}
          />
        </div>
      ) : (
        <Canvas
          className="!absolute inset-0"
          dpr={[1, 2]}
          camera={{ position: [0, 0, 4.6], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 5) 마퀴                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* 페이지                                                              */
/* ------------------------------------------------------------------ */

export type IntroProps = {
  /** 지정 시 3D 대신 이 GIF/이미지를 렌더링합니다. 예: "/motion/hero.gif" */
  mediaSrc?: string;
};

export default function Intro({ mediaSrc }: IntroProps) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [curtain, setCurtain] = useState(true);

  useEffect(() => {
    document.body.style.overflow = curtain ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [curtain]);

  // 커튼이 걷히면 본문 등장. (모션 최소화 등으로 exit 콜백이 없을 때의 안전장치)
  useEffect(() => {
    if (curtain) return;
    const id = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(id);
  }, [curtain]);

  return (
    <div
      id="top"
      className="relative min-h-[100svh] bg-white text-neutral-900 antialiased"
    >
      {/* 컴포넌트 전용 키프레임 (Tailwind config 수정 없이 동작) */}
      <style>{`
        @keyframes intro-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-intro-marquee { animation: intro-marquee 32s linear infinite; }
        @keyframes intro-scroll-dot { 0% { transform: translateY(-6px); opacity: 0; } 40% { opacity: 1; } 100% { transform: translateY(10px); opacity: 0; } }
        .animate-intro-scroll-dot { animation: intro-scroll-dot 1.8s ease-in-out infinite; }
      `}</style>

      <AnimatePresence onExitComplete={() => setReady(true)}>
        {curtain && (
          <IntroCurtain key="curtain" onDone={() => setCurtain(false)} />
        )}
      </AnimatePresence>

      <NavBar ready={ready} />

      {/* 좌측 세로 라벨 — 데스크톱 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
      >
        <span className="block text-[10px] uppercase tracking-[0.3em] text-neutral-300 [writing-mode:vertical-rl]">
          {t("footer.based")} — {PROFILE.year}
        </span>
      </motion.div>

      {/* 메인 */}
      <main className="bg-white mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-center px-5 pt-28 md:px-10 md:pb-28 md:pt-32">
        <div className="flex flex-col">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 xl:gap-16">
            {/* 텍스트 */}
            <div className="order-2 lg:order-1">
              <HeroType ready={ready} />
            </div>

            {/* 3D / GIF 영역 */}
            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <ObjectStage ready={ready} mediaSrc={mediaSrc} />
            </div>
          </div>
          <Work />
        </div>
      </main>

      {/* 하단 바 */}
      <Footer ready={ready} />
    </div>
  );
}
