import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, type = 'text', className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-[14px] font-medium text-ink-soft">{label}</label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={`h-[52px] w-full rounded-xl border border-line bg-white px-4 text-[16px] text-ink outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/15 ${
            isPassword ? 'pr-12' : ''
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
            aria-label="toggle password"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
          >
            {show ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
          </button>
        )}
      </div>
    </div>
  );
});

export default Input;
