import { Component, type ReactNode } from 'react';

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
          <p className="text-[16px] font-semibold text-ink">문제가 발생했어요</p>
          <p className="text-[14px] text-ink-soft">잠시 후 다시 시도해주세요.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-btn bg-primary px-6 py-3 text-[15px] font-semibold text-white transition-transform duration-200 ease-ios active:scale-[0.98]"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
