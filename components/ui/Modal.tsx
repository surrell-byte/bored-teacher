import { type ReactNode } from 'react';

type ModalProps = {
  children: ReactNode;
  title?: string;
  labelledBy?: string;
};

export default function Modal({ children, title, labelledBy }: ModalProps) {
  const titleId = labelledBy ?? (title ? 'modal-title' : undefined);

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal aria-labelledby={titleId}>
      <div className="modal">
        {title && (
          <div className="modal-header">
            <div className="modal-title" id={titleId}>
              {title}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
