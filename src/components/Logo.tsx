import Image from 'next/image';
import Link from 'next/link';

const SIZES = {
  sm: { full: { w: 140, h: 34 }, mark: { w: 36, h: 36 } },
  md: { full: { w: 200, h: 48 }, mark: { w: 44, h: 44 } },
  lg: { full: { w: 280, h: 68 }, mark: { w: 56, h: 56 } },
} as const;

type LogoProps = {
  variant?: 'full' | 'mark';
  size?: keyof typeof SIZES;
  href?: string;
  className?: string;
  priority?: boolean;
};

export default function Logo({
  variant = 'full',
  size = 'md',
  href,
  className = '',
  priority = false,
}: LogoProps) {
  const dims = SIZES[size][variant];
  const src = variant === 'full' ? '/brand/logo-full.png' : '/brand/logo-mark.png';

  const image = (
    <Image
      src={src}
      alt="ENABLED"
      width={dims.w}
      height={dims.h}
      priority={priority}
      className="h-auto w-auto max-h-full object-contain"
      style={{ maxHeight: dims.h, width: 'auto' }}
    />
  );

  const content =
    variant === 'full' ? (
      <span
        className={`inline-flex items-center rounded-xl dark:bg-[var(--logo-surface)] dark:px-2.5 dark:py-1.5 ${className}`}
      >
        {image}
      </span>
    ) : (
      <span className={`inline-flex items-center flex-shrink-0 ${className}`}>{image}</span>
    );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
