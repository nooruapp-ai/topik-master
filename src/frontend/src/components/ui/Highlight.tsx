interface HighlightProps {
  text: string;
  query: string;
}

/** 텍스트에서 검색어와 일치하는 첫 부분을 강조 표시합니다. */
export default function Highlight({ text, query }: HighlightProps) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-accent-yellow px-0.5 text-ink">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}
