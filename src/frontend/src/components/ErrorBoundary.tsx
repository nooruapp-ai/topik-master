import { Component, type ReactNode } from 'react';
import i18n from '../i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen max-w-mobile flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="text-5xl">😵</div>
          <p className="text-[16px] font-semibold text-ink">{i18n.t('errorBoundary.title')}</p>
          <p className="text-[14px] text-ink-soft">{i18n.t('errorBoundary.desc')}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-btn bg-primary px-6 py-3 text-[15px] font-semibold text-white transition-transform duration-200 ease-ios active:scale-[0.98]"
          >
            {i18n.t('errorBoundary.retry')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
