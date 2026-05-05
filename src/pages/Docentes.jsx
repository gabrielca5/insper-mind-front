import { useEffect, useState } from 'react';
import { docenteService } from '../services/docenteService';
import { DocenteCard } from '../components/DocenteCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './Docentes.module.css';

export function Docentes() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    docenteService.list(page).then(({ items, totalPages: tp }) => {
      setDocentes(items);
      setTotalPages(tp);
      setLoading(false);
    });
  }, [page]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Painel', to: '/' }, { label: 'Docentes' }]} />

        <header className={styles.header}>
          <h1 className={styles.title}>Docentes</h1>
          <p className={styles.sub}>Conheça os professores da plataforma</p>
        </header>

        {loading ? (
          <LoadingSpinner message="Carregando docentes..." />
        ) : docentes.length === 0 ? (
          <EmptyState
            icon="👩‍🏫"
            title="Nenhum docente cadastrado"
            subtitle="A API não retornou docentes ainda. Cadastre um via POST /docente."
          />
        ) : (
          <>
            <div className={styles.list}>
              {docentes.map((d) => (
                <DocenteCard key={d.id ?? d.email} docente={d} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Anterior</button>
                <span className={styles.pageInfo}>Página {page + 1} de {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Próxima →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
