import styles from './UI.module.css';
import { API_BASE_URL } from '../services/api';

export function LoadingSpinner({ message = 'Carregando...' }) {
  return (
    <div className={styles.center}>
      <div className={styles.spinner} />
      <p className={styles.msg}>{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Algo deu errado.', onRetry }) {
  return (
    <div className={styles.center}>
      <div className={styles.errorIcon}>⚠️</div>
      <p className={styles.errorMsg}>{message}</p>
      <p className={styles.errorSub}>Verifique se a API está acessível em <code>{API_BASE_URL}</code></p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>Tentar novamente</button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nenhum item encontrado', subtitle }) {
  return (
    <div className={styles.center}>
      <div className={styles.emptyIcon}>{icon}</div>
      <p className={styles.emptyTitle}>{title}</p>
      {subtitle && <p className={styles.emptySub}>{subtitle}</p>}
    </div>
  );
}
