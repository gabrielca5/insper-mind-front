import { Link } from 'react-router-dom';
import styles from './DisciplinaCard.module.css';

function getSemestreLabel(disciplina) {
  if (disciplina.nomeSemestre) return disciplina.nomeSemestre;
  if (disciplina.semestre) return `${disciplina.semestre}º sem`;
  if (disciplina.semestreId) return `Semestre #${disciplina.semestreId}`;
  return 'Sem semestre';
}

export function DisciplinaCard({ disciplina }) {
  return (
    <article className={styles.card}>
      <div className={styles.badges}>
        <span className={styles.semBadge}>{getSemestreLabel(disciplina)}</span>
        {disciplina.temDelta && <span className={styles.deltaBadge}>Delta</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{disciplina.nome}</h3>
        {disciplina.nomeCurso && (
          <p className={styles.meta}>{disciplina.nomeCurso}</p>
        )}
        {disciplina.descricao && (
          <p className={styles.desc}>{disciplina.descricao}</p>
        )}
        {!disciplina.descricao && disciplina.formulaAvaliacao && (
          <p className={styles.desc}>{disciplina.formulaAvaliacao}</p>
        )}
        {disciplina.criterioBarreira && (
          <p className={styles.detail}>{disciplina.criterioBarreira}</p>
        )}
      </div>

      <Link to={`/disciplinas/${disciplina.id}`} className={styles.link}>
        Ver disciplina →
      </Link>
    </article>
  );
}
