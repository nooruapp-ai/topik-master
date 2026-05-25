interface SpinnerProps {
  fullScreen?: boolean;
}

export default function Spinner({ fullScreen = false }: SpinnerProps) {
  const spinner = (
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
  );

  if (fullScreen) {
    return <div className="flex min-h-screen items-center justify-center bg-white">{spinner}</div>;
  }
  return <div className="flex justify-center py-12">{spinner}</div>;
}
