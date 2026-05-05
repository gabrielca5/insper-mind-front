import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cursoService } from '../services/cursoService';
import { disciplinaService } from '../services/disciplinaService';
import { DisciplinaCard } from '../components/DisciplinaCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './CursoDetalhe.module.css';

export function CursoDetalhe() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cursoService.getById(id),
      disciplinaService.listByCurso(id),
    ]).then(([c, d]) => {
      setCurso(c);
      setDisciplinas(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner message="Carregando curso..." />;
  if (!curso) return (
    <div className={styles.page}>
      <EmptyState icon="🎓" title="Curso não encontrado" />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Painel', to: '/' }, { label: curso.nome }]} />

        <header className={styles.header}>
          <h1 className={styles.title}>{curso.nome}</h1>
          {(curso.semestres || curso.turno) && (
            <div className={styles.meta}>
              {curso.semestres && <span>{curso.semestres} semestres</span>}
              {curso.turno && <span>{curso.turno}</span>}
              {curso.cargaHoraria && <span>{curso.cargaHoraria}h</span>}
            </div>
          )}
          {curso.descricao && (
            <p className={styles.desc}>{curso.descricao}</p>
          )}
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Disciplinas <span className={styles.count}>{disciplinas.length}</span>
          </h2>
          {disciplinas.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Nenhuma disciplina cadastrada"
              subtitle="As disciplinas deste curso ainda não foram registradas na API."
            />
          ) : (
            <div className={styles.grid}>
              {disciplinas.map((d) => (
                <DisciplinaCard key={d.id} disciplina={d} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
