import React, { ReactNode, useCallback } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  backdropClassName?: string;
  panelClassName?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, backdropClassName = 'htp-backdrop', panelClassName = 'htp-modal', children }: ModalProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div className={backdropClassName} onClick={handleBackdropClick}>
      <div className={panelClassName}>{children}</div>
    </div>
  );
}

