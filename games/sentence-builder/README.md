# Sentence Builder

This is a React port of the standalone "Typeset — Sentence Builder" page.

Usage
- Import and render `games/sentence-builder/SentenceBuilder.jsx` in a route or page.
- It's a client-side component (initialises in a `useEffect`), so render on the client.

Example (Next.js app router page):

```jsx
import dynamic from 'next/dynamic'
const SentenceBuilder = dynamic(() => import('../../../games/sentence-builder/SentenceBuilder'), { ssr: false })
export default function Page(){ return <SentenceBuilder/> }
```

The component embeds the original styles for pixel parity and the original interaction logic.
