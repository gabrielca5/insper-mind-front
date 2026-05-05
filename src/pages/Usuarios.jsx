import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './Usuarios.module.css';

function getInitials(nome) {
  return (nome ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    usuarioService.list(page).then(({ items, totalPages: tp }) => {
      setUsuarios(items);
      setTotalPages(tp);
      setLoading(false);
    });
  }, [page]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Painel', to: '/' }, { label: 'Usuários' }]} />

        <header className={styles.header}>
          <h1 className={styles.title}>Usuários</h1>
          <p className={styles.sub}>Lista de usuários cadastrados na plataforma</p>
        </header>

        {loading ? (
          <LoadingSpinner message="Carregando usuários..." />
        ) : usuarios.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Nenhum usuário cadastrado"
            subtitle="A API não retornou usuários ainda."
          />
        ) : (
          <>
            <div className={styles.list}>
              {usuarios.map((u) => (
                <article key={u.id ?? u.email} className={styles.card}>
                  <div className={styles.avatar}>{getInitials(u.nome)}</div>
                  <div className={styles.body}>
                    <h3 className={styles.name}>{u.nome}</h3>
                    <p className={styles.email}>{u.email}</p>
                    {u.dataCriacao && (
                      <p className={styles.since}>
                        Desde {new Date(u.dataCriacao).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/usuarios/${encodeURIComponent(u.email)}`}
                    className={styles.link}
                  >
                    Ver perfil →
                  </Link>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className={styles.pageBtn}
                >
                  ← Anterior
                </button>
                <span className={styles.pageInfo}>
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className={styles.pageBtn}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
