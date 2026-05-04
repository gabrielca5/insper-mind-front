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
          { label: 'Catálogo', to: '/' },
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
          <span className={styles.placeholderIcon}>🚧</span>
          <p className={styles.placeholderText}>
            As disciplinas e demais dados do docente estarão disponíveis quando o endpoint <code>/disciplina?docenteEmail</code> for implementado no backend.
          </p>
        </div>
      </div>
    </div>
  );
}
