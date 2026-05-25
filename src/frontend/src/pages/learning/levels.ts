import type { TopikLevel } from '../../types';

export interface LevelMeta {
  code: TopikLevel;
  title: string;
  sub: string;
  desc: string;
  emoji: string;
  accent: string; // 아이콘 칩 배경 (tailwind)
}

// 레벨 메타데이터 — 화면 표시에 사용. DB level 코드와 1:1 대응합니다.
export const LEVELS: LevelMeta[] = [
  {
    code: 'topik1',
    title: 'TOPIK I',
    sub: '초급 · 1~2급',
    desc: '기초 문법과 일상 어휘를 다집니다.',
    emoji: '🌱',
    accent: 'bg-accent-mint/40',
  },
  {
    code: 'topik2_mid',
    title: 'TOPIK II 중급',
    sub: '3~4급',
    desc: '중급 문법과 독해·듣기 실력을 키웁니다.',
    emoji: '🌿',
    accent: 'bg-primary-light',
  },
  {
    code: 'topik2_high',
    title: 'TOPIK II 고급',
    sub: '5~6급',
    desc: '고급 어휘와 쓰기·논술에 도전합니다.',
    emoji: '🌳',
    accent: 'bg-accent-yellow/50',
  },
];

export function levelTitle(code: string): string {
  return LEVELS.find((l) => l.code === code)?.title ?? code;
}
