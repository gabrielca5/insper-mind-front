import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { docenteService } from '../services/docenteService';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './DocenteDetalhe.module.css';

function getInitials(nome) {
  return (nome ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function DocenteDetalhe() {
  const { email } = useParams();
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    docenteService.getByEmail(decodeURIComponent(email)).then((d) => {
      setDocente(d);
      setLoading(false);
    });
  }, [email]);

  if (loading) return <LoadingSpinner message="Carregando docente..." />;
  if (!docente) return (
    <div className={styles.page}>
      <EmptyState icon="👤" title="Docente não encontrado" />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[
          { label: 'Painel', to: '/' },
          { label: 'Docentes', to: '/docentes' },
          { label: docente.nome },
        ]} />

        <div className={styles.profile}>
          <div className={styles.avatar}>{getInitials(docente.nome)}</div>
          <div className={styles.info}>
            <h1 className={styles.name}>{docente.nome}</h1>
            <p className={styles.email}>{docente.email}</p>
            {docente.dataCriacao && (
              <p className={styles.since}>
                Cadastrado em {new Date(docente.dataCriacao).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        <div className={styles.placeholder}>
          <p className={styles.placeholderText}>
            
          </p>
        </div>

        {docente.disciplinas && docente.disciplinas.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Disciplinas</h2>
              <p className={styles.sectionSub}>
                {docente.disciplinas.length} {docente.disciplinas.length === 1 ? 'disciplina' : 'disciplinas'}
              </p>
            </div>
            <div className={styles.disciplinasList}>
              {docente.disciplinas.map((disciplina) => (
                <div key={disciplina.id} className={styles.disciplinaItem}>
                  <h3 className={styles.disciplinaName}>{disciplina.nome}</h3>
                  {disciplina.formulaAvaliacao && (
                    <p className={styles.disciplinaInfo}>
                      <strong>Fórmula:</strong> {disciplina.formulaAvaliacao}
                    </p>
                  )}
                  {disciplina.criterioBarreira && (
                    <p className={styles.disciplinaInfo}>
                      <strong>Critério:</strong> {disciplina.criterioBarreira}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {(!docente.disciplinas || docente.disciplinas.length === 0) && (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Nenhuma disciplina associada a este docente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
