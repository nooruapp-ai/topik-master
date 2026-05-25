import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { createPost, getPosts } from '../api/posts';
import { getErrorMessage } from '../api/client';
import type { Post } from '../types';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';

const FILTERS = ['all', 'free', 'question', 'tip'];
const WRITE_CATEGORIES = ['free', 'question', 'tip'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export default function CommunityScreen() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('free');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getPosts(filter === 'all' ? undefined : filter)
      .then((data) => active && setPosts(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filter]);

  async function handleCreate() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const post = await createPost({ title, content, category });
      if (filter === 'all' || filter === category) {
        setPosts((prev) => [post, ...prev]);
      }
      setTitle('');
      setContent('');
      setCategory('free');
      setWriting(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-surface-soft">
      <TopBar
        title={t('community.title')}
        right={
          <Pressable
            onPress={() => setWriting((w) => !w)}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-90"
            accessibilityLabel={t('community.write')}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        }
      />
      <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-[14px] text-ink-soft">{t('community.subtitle')}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
          className="mb-5"
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                className={`rounded-full px-4 py-2 ${
                  active ? 'bg-primary' : 'border border-line bg-white'
                }`}
              >
                <Text
                  className={`text-[14px] font-medium ${active ? 'text-white' : 'text-ink-soft'}`}
                >
                  {t(`community.categoryFilter.${f}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {writing ? (
          <Card className="mb-5">
            <View className="gap-3">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={t('community.postTitlePlaceholder')}
                placeholderTextColor="#9CA3AF"
                className="h-[48px] w-full rounded-xl border border-line px-3 text-[15px] text-ink"
              />
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder={t('community.postContentPlaceholder')}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="h-28 w-full rounded-xl border border-line px-3 py-2.5 text-[15px] text-ink"
              />
              <View className="flex-row gap-2">
                {WRITE_CATEGORIES.map((c) => {
                  const active = category === c;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      className={`rounded-full px-3 py-1.5 ${
                        active ? 'bg-primary' : 'border border-line bg-white'
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-medium ${
                          active ? 'text-white' : 'text-ink-soft'
                        }`}
                      >
                        {t(`community.categoryFilter.${c}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Button onPress={handleCreate} loading={submitting}>
                {t('community.publish')}
              </Button>
            </View>
          </Card>
        ) : null}

        {loading ? (
          <Spinner />
        ) : error ? (
          <Card>
            <Text className="text-[14px] text-error">{error}</Text>
          </Card>
        ) : posts.length === 0 ? (
          <EmptyState
            emoji="📝"
            title={t('community.empty')}
            action={<Button onPress={() => setWriting(true)}>{t('community.write')}</Button>}
          />
        ) : (
          <View className="gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <Badge tone="neutral">
                  {t(`community.categoryFilter.${post.category}`, post.category)}
                </Badge>
                <Text className="mt-1.5 text-[16px] font-semibold text-ink">{post.title}</Text>
                <Text numberOfLines={2} className="mt-1 text-[14px] text-ink-soft">
                  {post.content}
                </Text>
                <View className="mt-3 flex-row items-center gap-2">
                  <Text className="text-[12px] text-ink-faint">{post.author?.username ?? '익명'}</Text>
                  <Text className="text-[12px] text-ink-faint">·</Text>
                  <Text className="text-[12px] text-ink-faint">{formatDate(post.created_at)}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
