import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
}

/** Barra de carregamento com proporção fixa — não usar como spinner genérico. */
export function Skeleton({ width = '100%', height = 14 }: SkeletonProps) {
  return <span className={styles.bar} style={{ width, height, display: 'block' }} aria-hidden="true" />;
}
