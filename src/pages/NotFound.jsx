import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.sub}>A rota que você tentou acessar não existe.</p>
        <Link to="/" className={styles.btn}>← Voltar ao catálogo</Link>
      </div>
    </div>
  );
}
