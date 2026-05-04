import { Link } from 'react-router-dom';
import styles from './DisciplinaCard.module.css';

export function DisciplinaCard({ disciplina }) {
  return (
    <article className={styles.card}>
      <div className={styles.semBadge}>
        {disciplina.semestre ? `${disciplina.semestre}º sem` : '—'}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{disciplina.nome}</h3>
        {disciplina.descricao && (
          <p className={styles.desc}>{disciplina.descricao}</p>
        )}
      </div>
      <Link to={`/disciplinas/${disciplina.id}`} className={styles.link}>
        Ver disciplina →
      </Link>
    </article>
  );
}
