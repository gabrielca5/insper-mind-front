import { Link } from 'react-router-dom';
import styles from './DocenteCard.module.css';

function getInitials(nome) {
  return (nome ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function DocenteCard({ docente }) {
  return (
    <article className={styles.card}>
      <div className={styles.avatar}>
        {getInitials(docente.nome)}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{docente.nome}</h3>
        <p className={styles.email}>{docente.email}</p>
      </div>
      <Link to={`/docentes/${encodeURIComponent(docente.email)}`} className={styles.link}>
        Ver perfil →
      </Link>
    </article>
  );
}
