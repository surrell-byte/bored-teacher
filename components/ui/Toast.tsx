'use client';

import { useState, useEffect } from 'react';
import '../styles/Toast.css';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastProps {
  messages?: ToastMessage[];
  onRemove?: (id: string) => void;
}

const EMPTY_MESSAGES: ToastMessage[] = [];

export default function Toast({ messages = EMPTY_MESSAGES, onRemove }: ToastProps) {
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>(messages);

  useEffect(() => {
    setActiveToasts(messages);
  }, [messages]);

  useEffect(() => {
    if (activeToasts.length === 0) return;

    const timers = activeToasts.map((toast) => {
      const duration = toast.duration || 3000;
      return setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
        onRemove?.(toast.id);
      }, duration);
    });

    return () => timers.forEach(clearTimeout);
  }, [activeToasts, onRemove]);

  return (
    <div className="toast-container">
      {activeToasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}