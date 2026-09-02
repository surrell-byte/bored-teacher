export default function Head() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preload" href="/assets/images/welcome-page.webp" as="image" />
      <link rel="preload" href="/assets/images/start-playing-page.webp" as="image" />
      <link rel="preload" href="/assets/images/auth-screen-bg.webp" as="image" />
      <link rel="preload" href="/assets/.optimized/logo.webp" as="image" fetchPriority="high" />
      <link rel="preload" href="/assets/.optimized/dashboard.webp" as="image" />
    </>
  );
}
