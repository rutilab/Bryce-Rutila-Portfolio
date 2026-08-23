'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Transient status pill, pinned above the bottom edge of the viewport.
 *
 * The touch counterpart to the cursor's `data-cursor-label` tag: a coarse
 * pointer has no hover, so the same message a mouse reads before clicking has
 * to arrive after the tap instead. Styled to match that tag deliberately —
 * same ink, same mono, same pill — so it reads as one idea shown two ways.
 *
 * Renders through a portal so a card's `overflow: hidden` or stacking context
 * can never clip or bury it. The entrance is a CSS animation rather than a
 * transition off a state flag, which keeps the mount a single render and needs
 * no "have we painted yet" bookkeeping.
 */
export function Toast({
  message,
  open,
  onDismiss,
  duration = 2400,
}: {
  message: string;
  open: boolean;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [open, duration, onDismiss]);

  // Server renders nothing (a toast is only ever opened by an interaction), so
  // `document` is always available by the time this portal is reached.
  if (!open) return null;

  return createPortal(
    <div className="toast-pill" role="status" aria-live="polite">
      {message}
    </div>,
    document.body,
  );
}

export default Toast;
