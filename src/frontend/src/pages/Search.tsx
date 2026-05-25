import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { search } from '../api/search';
import { getErrorMessage } from '../api/client';
import type { SearchResults } from '../types';
import Spinner from '../components/Spinner';
import TopBar from '../components/ui/TopBar';
import SearchBar from '../components/ui/SearchBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const { t } = useTranslation();

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
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
      <TopBar title={t('search.title')} showBack />
      <div className="px-5 pt-2">
        <div className="mb-5">
          <SearchBar initial={q} />
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card className="text-[14px] text-error">{error}</Card>
        ) : !q.trim() ? (
          <Card className="text-[14px] text-ink-faint">{t('search.prompt')}</Card>
        ) : total === 0 ? (
          <Card className="text-[14px] text-ink-faint">{t('search.noResults', { q })}</Card>
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
                          <p className="text-[15px] font-semibold text-ink">{c.title}</p>
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
                        <p className="text-[15px] text-ink">{p.question}</p>
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
                          <p className="text-[15px] font-semibold text-ink">{p.title}</p>
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
