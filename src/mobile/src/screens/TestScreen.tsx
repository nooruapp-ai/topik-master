import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react-native';
import { getProblems, submitAnswer } from '../api/problems';
import { getErrorMessage } from '../api/client';
import type { Problem, SubmissionResult } from '../types';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const CATEGORIES = ['all', 'listening', 'reading', 'grammar', 'vocabulary', 'writing'];

export default function TestScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState('all');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setIndex(0);
    setSelected('');
    setResult(null);
    setCorrectCount(0);
    setFinished(false);

    getProblems({ category: category === 'all' ? undefined : category, limit: 10 })
      .then((data) => active && setProblems(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category]);

  const current = problems[index];

  async function handleSubmit() {
    if (!current || !selected) return;
    setSubmitting(true);
    try {
      const res = await submitAnswer({ problem_id: current.id, answer: selected });
      setResult(res);
      if (res.is_correct) setCorrectCount((c) => c + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (index + 1 >= problems.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected('');
      setResult(null);
    }
  }

  function restart() {
    setIndex(0);
    setSelected('');
    setResult(null);
    setCorrectCount(0);
    setFinished(false);
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface-soft">
      <TopBar title={t('test.title')} />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-[14px] text-ink-soft">{t('test.subtitle')}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
          className="mb-5"
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 ${
                  active ? 'bg-primary' : 'border border-line bg-white'
                }`}
              >
                <Text
                  className={`text-[14px] font-medium ${active ? 'text-white' : 'text-ink-soft'}`}
                >
                  {t(`test.category.${cat}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card>
            <Text className="text-[14px] text-error">{error}</Text>
          </Card>
        ) : problems.length === 0 ? (
          <Card>
            <Text className="text-[14px] text-ink-faint">{t('test.empty')}</Text>
          </Card>
        ) : finished ? (
          <Card>
            <View className="items-center">
              <Text className="text-5xl">🏆</Text>
              <Text className="mt-3 text-title-m text-ink">{t('test.result')}</Text>
              <Text className="mt-2 text-[15px] text-ink-soft">
                {t('test.scoreSummary', { total: problems.length, correct: correctCount })}
              </Text>
              <Text className="mt-1 text-[14px] text-ink-faint">
                {t('test.accuracy', {
                  accuracy: Math.round((correctCount / problems.length) * 100),
                })}
              </Text>
              <Button onPress={restart} className="mt-6">
                {t('test.restart')}
              </Button>
            </View>
          </Card>
        ) : current ? (
          <Card>
            <Text className="mb-2 text-[12px] font-semibold text-primary">
              {t('test.question', { current: index + 1, total: problems.length })}
            </Text>
            <View className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${((index + 1) / problems.length) * 100}%` }}
              />
            </View>
            <Text className="mb-5 text-[18px] font-semibold leading-relaxed text-ink">
              {current.question}
            </Text>

            {current.options && current.options.length > 0 ? (
              <View className="gap-2.5">
                {current.options.map((option, i) => {
                  const isPicked = selected === option;
                  const showCorrect = result && option === result.correct_answer;
                  const showWrong = result && isPicked && !result.is_correct;
                  let box = 'border-line';
                  let txt = 'text-ink';
                  if (showCorrect) {
                    box = 'border-success bg-success/10';
                    txt = 'text-success';
                  } else if (showWrong) {
                    box = 'border-error bg-error/10';
                    txt = 'text-error';
                  } else if (isPicked) {
                    box = 'border-primary bg-primary-light';
                    txt = 'text-primary';
                  }
                  return (
                    <Pressable
                      key={i}
                      disabled={Boolean(result)}
                      onPress={() => setSelected(option)}
                      className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 ${box}`}
                    >
                      <Text className={`flex-1 text-[15px] ${txt}`}>{option}</Text>
                      {showCorrect ? <Check size={18} color="#10B981" strokeWidth={2} /> : null}
                      {showWrong ? <X size={18} color="#EF4444" strokeWidth={2} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <TextInput
                value={selected}
                onChangeText={setSelected}
                editable={!result}
                placeholder={t('test.start')}
                placeholderTextColor="#9CA3AF"
                className="h-[52px] w-full rounded-xl border border-line px-4 text-[16px] text-ink"
              />
            )}

            {result ? (
              <View
                className={`mt-4 rounded-xl p-4 ${
                  result.is_correct ? 'bg-success/10' : 'bg-error/10'
                }`}
              >
                <Text
                  className={`text-[14px] font-semibold ${
                    result.is_correct ? 'text-success' : 'text-error'
                  }`}
                >
                  {result.is_correct ? t('test.correct') : t('test.incorrect')}
                </Text>
                {!result.is_correct ? (
                  <Text className="mt-1 text-[14px] text-error">
                    {t('test.correctAnswer', { answer: result.correct_answer })}
                  </Text>
                ) : null}
                {result.explanation ? (
                  <Text className="mt-1 text-[14px] text-ink-soft">{result.explanation}</Text>
                ) : null}
              </View>
            ) : null}

            {result ? (
              <Button onPress={handleNext} className="mt-6">
                {index + 1 >= problems.length ? t('test.finish') : t('test.next')}
              </Button>
            ) : (
              <Button
                onPress={handleSubmit}
                loading={submitting}
                disabled={!selected}
                className="mt-6"
              >
                {t('common.submit')}
              </Button>
            )}
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
