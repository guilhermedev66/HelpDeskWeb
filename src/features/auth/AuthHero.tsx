import { BrandMark } from '../../components/BrandMark/BrandMark';
import styles from './LoginPage.module.css';

const BENEFITS = [
  'Centralize todos os chamados em um só lugar',
  'Acompanhe status, prioridade e SLA em tempo real',
  'Organize sua equipe com fluxos de atribuição claros',
];

// Painel institucional exibido ao lado do card de autenticação em telas grandes
// (>=1024px). Continua no DOM em telas menores — só fica oculto por CSS — pra
// não duplicar layout condicional em JS.
export function AuthHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <span className={styles.heroBrand}>
          <BrandMark size={30} />
          <span className={styles.heroBrandText}>Help Desk</span>
        </span>
        <h2 className={styles.heroTagline}>
          Centralize seus chamados. Organize sua equipe. Resolva mais rápido.
        </h2>
        <ul className={styles.heroBullets}>
          {BENEFITS.map((benefit) => (
            <li key={benefit}>
              <span className={styles.heroBulletDot} aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
