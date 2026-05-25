import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from 'lucide-react';

interface SearchBarProps {
  initial?: string;
}

export default function SearchBar({ initial = '' }: SearchBarProps) {
  const [q, setQ] = useState(initial);
  const navigate = useNavigate();
  const { t } = useTranslation();

  function submit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <SearchIcon
        size={18}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('search.placeholder')}
        className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-[15px] text-ink outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </form>
  );
}
