// Ícones discretos (16px, stroke) usados nos campos de autenticação.
// Inline em vez de dependência externa — mantém o bundle enxuto.

type IconProps = { className?: string };

export function MailIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2 4L8 9L14 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="7.25" width="10" height="6.75" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5 7.25V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7.25"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="5.25" r="2.75" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2.5 14C3.16 11.2 5.31 9.5 8 9.5C10.69 9.5 12.84 11.2 13.5 14"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M1.5 8C1.5 8 4 3 8 3C12 3 14.5 8 14.5 8C14.5 8 12 13 8 13C4 13 1.5 8 1.5 8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 2L14 14M6.5 6.6C6.19 6.93 6 7.44 6 8C6 9.1 6.9 10 8 10C8.55 10 9.05 9.79 9.4 9.44"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.1 4.3C2.6 5.3 1.5 8 1.5 8C1.5 8 4 13 8 13C9.15 13 10.15 12.6 11 12"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.7 10.4C13.7 9.5 14.5 8 14.5 8C14.5 8 12 3 8 3C7.5 3 7.05 3.07 6.63 3.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
