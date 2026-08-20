import styles from './BrandMark.module.css';

interface BrandMarkProps {
  size?: number;
  className?: string;
  /** Só passe quando a marca aparecer sozinha, sem texto "Help Desk" visível ao lado
   * (ex.: sidebar rail) — evita o leitor de tela anunciar o nome duas vezes. */
  label?: string;
}

// Monograma "HD" — mesmo vetor usado no favicon (public/favicon.svg), pra manter
// a marca idêntica em toda a aplicação sem depender de fonte em tempo de execução.
export function BrandMark({ size = 28, className, label }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? `${styles.mark} ${className}` : styles.mark}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width="40" height="40" rx="10" fill="url(#brandMarkGradient)" />
      <path
        d="M9.94815 24.5V13.5909H12.2546V18.092H16.9368V13.5909H19.2379V24.5H16.9368V19.9936H12.2546V24.5H9.94815ZM24.7067 24.5H20.8396V13.5909H24.7387C25.836 13.5909 26.7806 13.8093 27.5725 14.2461C28.3644 14.6793 28.9734 15.3026 29.3996 16.1158C29.8293 16.929 30.0441 17.902 30.0441 19.0348C30.0441 20.1712 29.8293 21.1477 29.3996 21.9645C28.9734 22.7812 28.3609 23.408 27.5619 23.8448C26.7664 24.2816 25.8147 24.5 24.7067 24.5ZM23.146 22.5238H24.6109C25.2927 22.5238 25.8662 22.4031 26.3314 22.1616C26.8001 21.9165 27.1517 21.5384 27.3861 21.027C27.624 20.5121 27.743 19.848 27.743 19.0348C27.743 18.2287 27.624 17.57 27.3861 17.0586C27.1517 16.5472 26.8019 16.1708 26.3367 15.9293C25.8715 15.6879 25.298 15.5671 24.6162 15.5671H23.146V22.5238Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="brandMarkGradient"
          x1="0"
          y1="11.4286"
          x2="28.5714"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}
