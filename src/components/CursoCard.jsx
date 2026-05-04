import { Link } from 'react-router-dom';
import styles from './CursoCard.module.css';

const CURSO_COLORS = {
  1: { bg: '#EEF2FF', accent: '#4F46E5', icon: '💻' },
  2: { bg: '#F0FDF4', accent: '#16A34A', icon: '⚙️' },
};

export function CursoCard({ curso }) {
  const theme = CURSO_COLORS[curso.id] ?? { bg: '#F8FAFC', accent: '#334155', icon: '📚' };

  return (
    <article className={styles.card} style={{ '--card-bg': theme.bg, '--card-accent': theme.accent }}>
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{theme.icon}</span>
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{curso.nome}</h2>
        {curso.semestres && (
          <p className={styles.meta}>{curso.semestres} semestres · {curso.turno}</p>
        )}
        <p className={styles.desc}>{curso.descricao}</p>
      </div>
      <Link to={`/cursos/${curso.id}`} className={styles.btn}>
        Ver detalhes →
      </Link>
    </article>
  );
}
