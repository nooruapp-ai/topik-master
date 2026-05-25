import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Signup() {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(email, password, username);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-mobile flex-col justify-center bg-white px-5">
      <div className="mb-8 text-center">
        <h1 className="text-title-l text-ink">{t('auth.signupTitle')}</h1>
        <p className="mt-1.5 text-[14px] text-ink-soft">{t('app.tagline')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.username')}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('auth.usernamePlaceholder')}
          required
        />
        <Input
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          required
        />
        <Input
          label={t('auth.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          required
          minLength={6}
        />

        {error && <p className="text-[14px] text-error">{error}</p>}

        <Button type="submit" disabled={submitting} className="mt-2">
          {submitting ? t('common.loading') : t('auth.signupButton')}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-ink-soft">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary">
          {t('auth.goLogin')}
        </Link>
      </p>
    </div>
  );
}
