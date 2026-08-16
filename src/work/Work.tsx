/**
 * Work.tsx — 프로젝트 캐러셀 섹션
 *
 * · 세로로 긴 직사각형 카드(3:4 이미지 + 텍스트), 가운데 카드만 원본 크기
 * · 중앙 카드 뒤로 라이트 글로우 + 깊은 섀도우
 * · 마우스 드래그 / 터치 스와이프 / 휠(가로) / 화살표 키 / 좌우 버튼 / 도트 모두 지원
 * · 데이터는 src/data/projects.json → useProjects()
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useProjects, type Project } from "../data/projects";

/* ------------------------------------------------------------------ */
/* 레이아웃 수치                                                        */
/* ------------------------------------------------------------------ */

/** 뷰포트별 카드 크기(px) — 세로로 긴 비율 유지 */
function useCardMetrics() {
  const [m, setM] = useState({ w: 300, h: 460, spacing: 246 });

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const w =
        vw < 480
          ? Math.min(vw - 72, 268)
          : vw < 768
            ? 288
            : vw < 1280
              ? 320
              : 348;
      const h = Math.round(w * 1.52); // 세로로 긴 직사각형
      // 좌우 카드가 살짝 겹치도록: 중앙 카드 폭의 0.82배 간격
      setM({ w, h, spacing: Math.round(w * (vw < 768 ? 0.88 : 0.82)) });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return m;
}

/** 이 값보다 멀리 있는 카드는 렌더 생략 */
const VISIBLE_RANGE = 2;

/* ------------------------------------------------------------------ */
/* 카드                                                                */
/* ------------------------------------------------------------------ */

type CardProps = {
  project: Project;
  offset: number;
  metrics: { w: number; h: number; spacing: number };
  active: boolean;
  reduce: boolean;
  onSelect: () => void;
};

function ProjectCard({
  project,
  offset,
  metrics,
  active,
  reduce,
  onSelect,
}: CardProps) {
  const { t } = useTranslation();
  const { t: L, formatPeriod } = useProjects();
  const [imgFailed, setImgFailed] = useState(false);
  const abs = Math.abs(offset);

  return (
    <motion.article
      className="absolute left-1/2 top-1/2 select-none"
      style={{
        width: metrics.w,
        height: metrics.h,
        marginLeft: -metrics.w / 2,
        marginTop: -metrics.h / 2,
      }}
      initial={false}
      animate={{
        x: offset * metrics.spacing,
        scale: active ? 1 : 0.84 - (abs - 1) * 0.05,
        opacity: abs > VISIBLE_RANGE ? 0 : active ? 1 : 0.55,
        rotateY: reduce ? 0 : offset * -7,
        zIndex: 20 - abs,
        filter: active ? "blur(0px)" : "blur(1.2px)",
      }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: "spring", stiffness: 210, damping: 30, mass: 0.9 }
      }
      aria-hidden={!active}
    >
      {/* 중앙 카드 뒤 라이트 글로우 */}
      <motion.div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[40px]"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, rgba(124,138,126,0.20), rgba(124,138,126,0.06) 55%, rgba(255,255,255,0) 78%)",
          filter: "blur(28px)",
        }}
      />

      <div
        className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border bg-white text-left transition-shadow duration-500 ${
          active
            ? "border-neutral-200/80 shadow-[0_32px_70px_-24px_rgba(20,20,20,0.28),0_8px_24px_-12px_rgba(20,20,20,0.14)]"
            : "border-neutral-100 shadow-[0_10px_30px_-18px_rgba(20,20,20,0.2)]"
        }`}
      >
        {/* 비활성 카드: 카드 전체를 덮는 선택 버튼 (중첩 인터랙티브 방지) */}
        {!active && (
          <button
            type="button"
            onClick={onSelect}
            aria-label={L(project.title)}
            className="absolute inset-0 z-10 cursor-pointer rounded-[22px]"
          />
        )}

        {/* 상단 이미지 */}
        <div
          className="relative w-full shrink-0 overflow-hidden bg-neutral-50"
          style={{ height: "52%" }}
        >
          {project.thumbnail && !imgFailed ? (
            <img
              src={project.thumbnail}
              alt={L(project.title)}
              onError={() => setImgFailed(true)}
              draggable={false}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          ) : (
            // 썸네일 없을 때의 플레이스홀더
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg,#F6F5F2 0%,#E9E6E0 55%,#DEDAD2 100%)",
              }}
            >
              <span className="text-[11px] uppercase tracking-[0.28em] text-neutral-400">
                {project.id.split("-")[0]}
              </span>
            </div>
          )}

          {project.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-neutral-600 backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>

        {/* 본문 */}
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-5 pb-5 pt-4">
          {/* 날짜 */}
          <p className="font-mono text-[10px] tracking-[0.16em] text-neutral-400">
            {formatPeriod(project, t("work.ongoing"))}
          </p>

          {/* 제목 */}
          <h3 className="text-[19px] font-medium leading-snug tracking-[-0.02em] text-neutral-900">
            {L(project.title)}
          </h3>

          {/* 사용 언어 */}
          <ul className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 3).map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] tracking-wide text-neutral-500"
              >
                {tech}
              </li>
            ))}
            {project.tech.length > 3 && (
              <li className="px-1 py-0.5 text-[10px] text-neutral-400">
                +{project.tech.length - 3}
              </li>
            )}
          </ul>

          {/* 간단 설명 */}
          <p className="line-clamp-3 text-[12.5px] leading-relaxed text-neutral-500">
            {L(project.description)}
          </p>

          {/* 링크 */}
          <div className="mt-auto flex items-center gap-3 pt-2">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                tabIndex={active ? 0 : -1}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
              >
                {link.label}
                <svg
                  viewBox="0 0 16 16"
                  className="h-2.5 w-2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path d="M5 11 11 5M6 5h5v5" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* 섹션                                                                */
/* ------------------------------------------------------------------ */

export default function Work() {
  const { t } = useTranslation();
  const { list } = useProjects();
  const metrics = useCardMetrics();
  const reduce = useReducedMotion() ?? false;

  const [active, setActive] = useState(0);
  const total = list.length;
  const trackRef = useRef<HTMLDivElement>(null);

  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(total - 1, i)),
    [total],
  );
  const go = useCallback((i: number) => setActive(clamp(i)), [clamp]);
  const step = useCallback(
    (d: number) => setActive((prev) => clamp(prev + d)),
    [clamp],
  );

  /* 드래그 / 스와이프 종료 → 속도 + 이동량으로 인덱스 결정 */
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const throwDistance = offset.x + velocity.x * 0.18;
    const moved = Math.round(-throwDistance / metrics.spacing);
    step(
      moved === 0
        ? Math.abs(offset.x) > metrics.spacing * 0.22
          ? offset.x < 0
            ? 1
            : -1
          : 0
        : moved,
    );
  };

  /* 가로 휠 / 트랙패드 */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let locked = false;

    const onWheel = (e: WheelEvent) => {
      const dx =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : e.shiftKey
            ? e.deltaY
            : 0;
      if (!dx) return; // 세로 스크롤은 페이지에 양보
      e.preventDefault();
      if (locked || Math.abs(dx) < 12) return;
      locked = true;
      step(dx > 0 ? 1 : -1);
      window.setTimeout(() => {
        locked = false;
      }, 320);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [step]);

  /* 화살표 키 */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  };

  if (total === 0) return null;

  return (
    <section
      id="work"
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      {/* 헤더 */}
      <div className="mx-auto mb-12 max-w-[1600px] px-5 md:mb-16 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.34em] text-neutral-400 md:text-[11px]">
              {t("work.eyebrow")}
            </p>
            <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-light leading-[0.9] tracking-[-0.04em] text-neutral-900">
              {t("work.title")}
            </h2>
          </div>

          {/* 카운터 + 좌우 버튼 */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tabular-nums tracking-[0.14em] text-neutral-400">
              {t("work.count", {
                current: String(active + 1).padStart(2, "0"),
                total: String(total).padStart(2, "0"),
              })}
            </span>
            <div className="flex items-center gap-2">
              {([-1, 1] as const).map((d) => {
                const disabled = d === -1 ? active === 0 : active === total - 1;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => step(d)}
                    disabled={disabled}
                    aria-label={t(d === -1 ? "work.prev" : "work.next")}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-all duration-300 hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-neutral-200"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    >
                      <path
                        d={
                          d === -1
                            ? "M14 8H2m5-5L2 8l5 5"
                            : "M2 8h12M9 3l5 5-5 5"
                        }
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 캐러셀 트랙 */}
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={t("work.title")}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative w-full cursor-grab touch-pan-y outline-none focus-visible:ring-1 focus-visible:ring-neutral-300 active:cursor-grabbing"
        style={{ height: metrics.h + 96, perspective: 1600 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {list.map((project, i) => {
            const offset = i - active;
            if (Math.abs(offset) > VISIBLE_RANGE) return null;
            return (
              <ProjectCard
                key={project.id}
                project={project}
                offset={offset}
                metrics={metrics}
                active={offset === 0}
                reduce={reduce}
                onSelect={() => (offset === 0 ? undefined : go(i))}
              />
            );
          })}
        </motion.div>
      </div>

      {/* 도트 + 안내 */}
      <div className="mx-auto mt-10 flex max-w-[1600px] flex-col items-center gap-4 px-5 md:px-10">
        <div className="flex items-center gap-2">
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              aria-label={t("work.goTo", { index: i + 1 })}
              aria-current={i === active}
              className="group flex h-6 items-center px-0.5"
            >
              <span
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  i === active
                    ? "w-8 bg-neutral-900"
                    : "w-3 bg-neutral-200 group-hover:bg-neutral-400"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-300">
          {t("work.subtitle")}
        </p>
      </div>
    </section>
  );
}
