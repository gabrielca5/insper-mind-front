import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { disciplinaService } from '../services/disciplinaService';
import { materialService } from '../services/materialService';
import { docenteService } from '../services/docenteService';
import { MaterialCard } from '../components/MaterialCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './DisciplinaDetalhe.module.css';

export function DisciplinaDetalhe() {
  const { id } = useParams();
  const [disciplina, setDisciplina] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    disciplinaService.getById(id).then(async (d) => {
      setDisciplina(d);
      const mats = await materialService.listByDisciplina(id);
      setMateriais(mats);
      if (d?.docenteEmail) {
        const doc = await docenteService.getByEmail(d.docenteEmail);
        setDocente(doc);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner message="Carregando disciplina..." />;
  if (!disciplina) return (
    <div className={styles.page}>
      <EmptyState icon="📋" title="Disciplina não encontrada" />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[
          { label: 'Catálogo', to: '/' },
          ...(disciplina.cursoId ? [{ label: 'Curso', to: `/cursos/${disciplina.cursoId}` }] : []),
          { label: disciplina.nome },
        ]} />

        <header className={styles.header}>
          {disciplina.semestre && (
            <span className={styles.semBadge}>{disciplina.semestre}º Semestre</span>
          )}
          <h1 className={styles.title}>{disciplina.nome}</h1>
          {disciplina.descricao && (
            <p className={styles.desc}>{disciplina.descricao}</p>
          )}
        </header>

        {docente && (
          <div className={styles.docenteBox}>
            <span className={styles.docenteLabel}>Docente responsável</span>
            <p className={styles.docenteName}>{docente.nome}</p>
            <p className={styles.docenteEmail}>{docente.email}</p>
          </div>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Materiais <span className={styles.count}>{materiais.length}</span>
          </h2>
          {materiais.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Nenhum material cadastrado"
              subtitle="Os materiais desta disciplina ainda não foram registrados na API."
            />
          ) : (
            <div className={styles.list}>
              {materiais.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
