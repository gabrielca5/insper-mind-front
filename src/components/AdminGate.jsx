import { useState } from 'react';
import { Link } from 'react-router-dom';
import { readAdminAccess, saveAdminAccess } from '../services/adminAccessStorage';
import styles from './AdminGate.module.css';

const ADMIN_PASSWORD = 'hector';

export function AdminGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => readAdminAccess());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      saveAdminAccess();
      setUnlocked(true);
      setError('');
      return;
    }

    setError('Senha de admin incorreta.');
  };

  if (unlocked) {
    return children;
  }

  return (
    <div className={styles.page}>
      <form className={styles.panel} onSubmit={handleSubmit}>
        <span className={styles.badge}>Admin</span>
        <h1 className={styles.title}>Área administrativa</h1>
        <p className={styles.sub}>Digite a senha local para liberar as rotas administrativas.</p>

        <label className={styles.label}>
          <span>Senha</span>
          <input
            className={styles.input}
            type="password"
            value={password}
            autoFocus
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submit} type="submit">
          Entrar no admin
        </button>
        <Link className={styles.backLink} to="/">
          Voltar ao catálogo
        </Link>
      </form>
    </div>
  );
}
