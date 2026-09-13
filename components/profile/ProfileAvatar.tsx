import type { CSSProperties } from 'react';

export function isImageAvatar(value: string) {
	return value.startsWith('/') || value.startsWith('//') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/');
}

type ProfileAvatarProps = {
	value: string;
	size?: number;
	alt?: string;
	className?: string;
	style?: CSSProperties;
};

export default function ProfileAvatar({ value, size, alt = '', className, style }: ProfileAvatarProps) {
	if (!isImageAvatar(value)) {
		return <span className={className} style={{ fontSize: size ? size * 0.55 : undefined, lineHeight: 1, ...style }}>{value}</span>;
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
