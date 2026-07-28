'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  onExit?: () => void;
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Keeps a broken game from taking the player out of the game hub. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Game crashed', error, info);
  }

  private retry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <section className="game-shell-error" role="alert">
        <span aria-hidden="true" className="game-shell-error-icon">⚠️</span>
        <h2>Something went wrong</h2>
        <p>This game could not continue. You can safely start a new round or return to the hub.</p>
        <div className="game-shell-overlay-actions">
          <button type="button" className="game-shell-primary-action" onClick={this.retry}>Try again</button>
          {this.props.onExit && <button type="button" className="game-shell-secondary-action" onClick={this.props.onExit}>Return to hub</button>}
        </div>
      </section>
    );
  }
}
