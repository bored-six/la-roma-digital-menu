import { Component, type ReactNode } from 'react';
import { resetAnatomia } from './anatomiaLoader';

interface Props {
  children: ReactNode;
  /** Called once when the sheet failed (chunk fetch or a render error). The parent closes it and may say so. */
  onFail(error: unknown): void;
}

/**
 * Anatomia is lazy-loaded and portaled. If its chunk fails to fetch (flaky signal, or a redeploy changed the file hash) or it throws
 * while rendering, this catches it: the sheet closes, the rest of the app keeps running, and the lazy component is reset so the
 * next press tries again. Without it a failed import unmounts the whole React tree.
 */
export class AnatomiaBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    resetAnatomia();
    this.props.onFail(error);
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
