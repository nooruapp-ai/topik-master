type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, string> = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-16 w-16 text-2xl',
};

interface AvatarProps {
  name?: string | null;
  size?: Size;
  className?: string;
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initial = (name?.trim()?.charAt(0) || '?').toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white ${sizes[size]} ${className}`}
    >
      {initial}
    </div>
  );
}
