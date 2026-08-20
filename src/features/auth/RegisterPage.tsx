import { Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

/** Stub — cadastro completo (POST /api/auth/register) fica para o próximo marco. */
export function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Criar conta</h1>
          <p className={styles.subtitle}>O cadastro chega no próximo marco.</p>
        </div>
        <p className={styles.footer}>
          <Link to="/login">Voltar para o login</Link>
        </p>
      </div>
    </div>
  );
}
