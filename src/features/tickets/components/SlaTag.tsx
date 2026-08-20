import type { SlaVisual } from '../sla';
import styles from './Badge.module.css';

const TONE_CLASS: Record<SlaVisual['tone'], string> = {
  ok: styles['sla-ok'],
  'at-risk': styles['sla-at-risk'],
  breached: styles['sla-breached'],
  done: styles['sla-done'],
};

export function SlaTag({ visual }: { visual: SlaVisual }) {
  return <span className={`${styles.sla} ${TONE_CLASS[visual.tone]}`}>{visual.label}</span>;
}
