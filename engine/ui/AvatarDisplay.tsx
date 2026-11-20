import type { CSSProperties } from 'react';

export function isImageAvatar(value: string) {
  return value.startsWith('/') || value.startsWith('//') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/');
}

type AvatarDisplayProps = {
  value: string;
  size?: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

export default function AvatarDisplay({ value, size, alt = '', className, style }: AvatarDisplayProps) {
  if (!isImageAvatar(value)) {
    return <span className={className} style={{ display: 'inline-grid', placeItems: 'center', fontSize: size ? size * 0.55 : undefined, lineHeight: 1, ...style }}>{value}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={value}
      alt={alt}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', ...style }}
    />
  );
}
