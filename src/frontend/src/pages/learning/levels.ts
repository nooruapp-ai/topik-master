import type { TopikLevel } from '../../types';

export interface LevelMeta {
  code: TopikLevel;
  emoji: string;
  accent: string; // 아이콘 칩 배경 (tailwind)
}

// 레벨 시각 메타데이터. 표시 텍스트(제목/부제/설명)는 i18n(learn.levelTitle 등)에서 가져옵니다.
export const LEVELS: LevelMeta[] = [
  { code: 'topik1', emoji: '🌱', accent: 'bg-accent-mint/40' },
  { code: 'topik2_mid', emoji: '🌿', accent: 'bg-primary-light' },
  { code: 'topik2_high', emoji: '🌳', accent: 'bg-accent-yellow/50' },
];
