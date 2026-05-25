import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { search } from '../api/search';
import { getErrorMessage } from '../api/client';
import type { SearchResults } from '../types';
import { getRecentSearches, clearRecentSearches } from '../lib/recentSearches';
import Spinner from '../components/Spinner';
import TopBar from '../components/ui/TopBar';
import SearchBar from '../components/ui/SearchBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Highlight from '../components/ui/Highlight';
import EmptyState from '../components/ui/EmptyState';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<string[]>(() => getRecentSearches());

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      setRecent(getRecentSearches());
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    search(q)
      .then((r) => active && setResults(r))
      .catch((e) => active && setError(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [q]);

  const total = results
    ? results.courses.length + results.problems.length + results.posts.length
    : 0;

  return (
    <div>
      <TopBar title={t('search.title')} showBack showSearch={false} />
      <div className="px-5 pt-2">
        <div className="mb-5">
          <SearchBar initial={q} />
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : !q.trim() ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-title-m text-ink">{t('search.recent')}</h2>
              {recent.length > 0 && (
                <button
                  onClick={() => {
                    clearRecentSearches();
                    setRecent([]);
                  }}
                  className="text-[13px] text-ink-faint"
                >
                  {t('search.clear')}
                </button>
              )}
            </div>
            {recent.length === 0 ? (
              <Card className="text-[14px] text-ink-faint">{t('search.prompt')}</Card>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <button
                    key={term}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-[14px] text-ink-soft"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : total === 0 ? (
          <EmptyState emoji="🔍" title={t('search.noResults', { q })} />
        ) : (
          <div className="space-y-6">
            {results!.courses.length > 0 && (
              <section>
                <h2 className="mb-2 text-title-m text-ink">
                  {t('nav.learning')} ({results!.courses.length})
                </h2>
                <ul className="space-y-3">
                  {results!.courses.map((c) => (
                    <li key={c.id}>
                      <Link to={`/learning/${c.id}`}>
                        <Card className="flex items-center gap-3 transition-transform duration-200 ease-ios active:scale-[0.99]">
                          <Badge>{t('common.level', { level: c.level })}</Badge>
                          <p className="text-[15px] font-semibold text-ink">
                            <Highlight text={c.title} query={q} />
                          </p>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results!.problems.length > 0 && (
              <section>
                <h2 className="mb-2 text-title-m text-ink">
                  {t('nav.test')} ({results!.problems.length})
                </h2>
                <ul className="space-y-3">
                  {results!.problems.map((p) => (
                    <li key={p.id}>
                      <Card>
                        <div className="mb-1">
                          <Badge tone="mint">{t(`test.category.${p.category}`, p.category)}</Badge>
                        </div>
                        <p className="text-[15px] text-ink">
                          <Highlight text={p.question} query={q} />
                        </p>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results!.posts.length > 0 && (
              <section>
                <h2 className="mb-2 text-title-m text-ink">
                  {t('nav.community')} ({results!.posts.length})
                </h2>
                <ul className="space-y-3">
                  {results!.posts.map((p) => (
                    <li key={p.id}>
                      <Link to={`/community/${p.id}`}>
                        <Card className="transition-transform duration-200 ease-ios active:scale-[0.99]">
                          <p className="text-[15px] font-semibold text-ink">
                            <Highlight text={p.title} query={q} />
                          </p>
                          <p className="mt-1 line-clamp-1 text-[13px] text-ink-soft">{p.content}</p>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
