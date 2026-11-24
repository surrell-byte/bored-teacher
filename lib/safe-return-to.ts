const RETURN_TO_ORIGIN = 'https://return-to.invalid';

export function getSafeReturnTo(value: string | null): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u0020\u007f]/.test(value)
  ) {
    return '/hub';
  }

  const destination = new URL(value, RETURN_TO_ORIGIN);
  if (destination.origin !== RETURN_TO_ORIGIN || destination.pathname.startsWith('//')) {
    return '/hub';
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
