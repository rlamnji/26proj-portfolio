/**
 * projects.ts — projects.json 을 타입과 함께 읽는 유일한 통로.
 * 컴포넌트에서는 항상 이 파일만 import 하세요.
 */

import { useTranslation } from "react-i18next";
import raw from "./projects.json";
import type { SupportedLanguage } from "../i18n";

/* ------------------------------- 타입 ------------------------------- */

/** ko / en / ja 3개 언어를 모두 가진 텍스트 */
export type Localized = Record<SupportedLanguage, string>;

export type ProjectLink = {
  label: string;
  url: string;
};

export type Project = {
  /** URL 슬러그 (중복 불가) */
  id: string;
  title: Localized;
  /** "YYYY-MM" — 정렬 기준 */
  date: string;
  /** 선택 — 카드에 기간으로 노출. end: null 이면 진행 중 */
  period?: { start: string; end?: string | null };
  role?: string;
  /** 사용 언어·기술 */
  tech: string[];
  description: Localized;
  links: ProjectLink[];
  thumbnail?: string;
  featured?: boolean;
};

/* ------------------------------ 데이터 ------------------------------ */

/** 최신순(date 내림차순) 정렬된 전체 프로젝트 */
export const projects: Project[] = [...(raw.projects as Project[])].sort(
  (a, b) => b.date.localeCompare(a.date),
);

export const featuredProjects: Project[] = projects.filter((p) => p.featured);

export const getProject = (id: string): Project | undefined =>
  projects.find((p) => p.id === id);

/** 특정 기술이 쓰인 프로젝트만 (대소문자 무시) */
export const getProjectsByTech = (tech: string): Project[] =>
  projects.filter((p) =>
    p.tech.some((t) => t.toLowerCase() === tech.toLowerCase()),
  );

/** 전체 프로젝트에 등장한 기술 목록 (빈도 내림차순) */
export const allTech: string[] = Object.entries(
  projects.reduce<Record<string, number>>((acc, p) => {
    p.tech.forEach((t) => {
      acc[t] = (acc[t] ?? 0) + 1;
    });
    return acc;
  }, {}),
)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([t]) => t);

/* ------------------------------ 헬퍼 ------------------------------- */

const FALLBACK: SupportedLanguage = "ko";

const normalize = (lng?: string): SupportedLanguage => {
  const base = (lng ?? FALLBACK).split("-")[0];
  return base === "en" || base === "ja" ? base : FALLBACK;
};

/** 현재 언어의 문자열을 꺼냅니다. 값이 비어 있으면 한국어로 대체. */
export const localize = (field: Localized, lng?: string): string => {
  const lang = normalize(lng);
  return field[lang] || field[FALLBACK];
};

/** "2025-11" + "2026-03" → "2025.11 — 2026.03" (end 없으면 "2026.03 —") */
export const formatPeriod = (project: Project, ongoingLabel = "—"): string => {
  const dot = (ym: string) => ym.replace("-", ".");
  if (!project.period) return dot(project.date);
  const { start, end } = project.period;
  return end
    ? `${dot(start)} — ${dot(end)}`
    : `${dot(start)} — ${ongoingLabel}`;
};

/**
 * 컴포넌트용 훅. 현재 i18n 언어가 이미 적용된 형태로 돌려줍니다.
 *
 * const { list, t } = useProjects();
 * list.map(p => <h3>{t(p.title)}</h3>)
 */
export function useProjects() {
  const { i18n } = useTranslation();
  const lng = i18n.resolvedLanguage;

  return {
    list: projects,
    featured: featuredProjects,
    allTech,
    /** Localized → string */
    t: (field: Localized) => localize(field, lng),
    formatPeriod,
  };
}
