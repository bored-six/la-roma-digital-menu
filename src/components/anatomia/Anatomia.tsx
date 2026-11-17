import type { AnatomiaProps } from '../../types';

// Stub, replaced by the real overlay in the next step.
export function Anatomia({ item, onClose }: AnatomiaProps) {
  return <button type="button" onClick={onClose}>{item.name}</button>;
}
export default Anatomia;
