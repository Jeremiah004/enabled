import Image from 'next/image';
import Link from 'next/link';

type LogoProps = {
  variant?: 'full' | 'mark';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  priority?: boolean;
};

const HEIGHT = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

export default function Logo({
  variant = 'full',
  size = 'md',
  href,
  className = '',
  priority = false,
}: LogoProps) {
  const height = HEIGHT[size];
  const src = variant === 'full' ? '/brand/logo-full.png' : '/brand/logo-mark.png';

  const image = (
    <Image
      src={src}
      alt="ENABLED"
      width={variant === 'full' ? Math.round(height * 4.1) : height}
      height={height}
      priority={priority}
      className="h-8 w-auto max-w-full object-contain object-left"
      style={{ height: `${height}px`, width: 'auto', maxWidth: variant === 'full' ? '200px' : '48px' }}
    />
  );

  const content =
    variant === 'full' ? (
      <span
        className={`inline-flex items-center max-w-full rounded-xl dark:bg-[var(--logo-surface)] dark:px-2.5 dark:py-1 ${className}`}
      >
        {image}
      </span>
    ) : (
      <span className={`inline-flex items-center max-w-[48px] overflow-hidden ${className}`}>
        {image}
      </span>
    );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block max-w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
