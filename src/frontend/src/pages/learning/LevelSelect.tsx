import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import { LEVELS } from './levels';

export default function LevelSelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <TopBar title={t('learn.title')} />
      <div className="px-5 pt-2">
        <p className="mb-5 text-[14px] text-ink-soft">{t('learn.selectLevel')}</p>
        <ul className="space-y-4">
          {LEVELS.map((lv) => (
            <li key={lv.code}>
              <button
                onClick={() => navigate(`/learning/${lv.code}`)}
                className="w-full text-left"
              >
                <Card className="flex items-center gap-4 transition-transform duration-200 ease-ios active:scale-[0.99]">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl3 text-3xl ${lv.accent}`}
                  >
                    {lv.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-title-m text-ink">{t(`learn.levelTitle.${lv.code}`)}</p>
                      <span className="text-[12px] font-semibold text-ink-faint">
                        {t(`learn.levelSub.${lv.code}`)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[14px] text-ink-soft">{t(`learn.levelDesc.${lv.code}`)}</p>
                  </div>
                  <ChevronRight size={20} strokeWidth={1.75} className="shrink-0 text-ink-faint" />
                </Card>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
