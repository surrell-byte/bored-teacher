declare module '*.css';

interface Window {
	__farmGameComplete?: (score: number, accuracy: number) => void;
}