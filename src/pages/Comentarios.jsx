import { useCallback, useEffect, useMemo, useState } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { FormModal } from '../components/FormModal';
import { EmptyState, LoadingSpinner } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import { comentarioService } from '../services/comentarioService';
import styles from './Comentarios.module.css';

function createFields(auth) {
  return [
    { name: 'materialId', label: 'ID do material', type: 'number', valueType: 'number', required: true },
    { name: 'idDisciplina', label: 'ID da disciplina', type: 'number', valueType: 'number', required: true },
    { name: 'comentario', label: 'Comentário', type: 'textarea', required: true },
    {
      name: 'emailUsuario',
      label: 'Email do usuário',
      type: 'email',
      required: true,
      disabled: Boolean(auth?.email),
      defaultValue: auth?.email ?? '',
    },
  ];
}

function editFields(comentario = {}) {
  return [
    {
      name: 'comentario',
      label: 'Comentário',
      type: 'textarea',
      required: true,
      defaultValue: comentario.comentario ?? '',
    },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: comentario.ativo ?? true },
  ];
}

export function Comentarios() {
  const auth = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);

  const fields = useMemo(() => createFields(auth), [auth]);
  const updateFields = useMemo(() => editFields(editing ?? {}), [editing]);

  const loadComentarios = useCallback(async (nextPage = page) => {
    setLoading(true);
    const data = await comentarioService.listPage(nextPage, 20);
    setComentarios(data.items ?? []);
    setTotalPages(data.totalPages ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    loadComentarios(page);
  }, [loadComentarios, page]);

  const handleCreate = async (payload) => {
    const result = await comentarioService.save(payload);
    setMessage('Comentário publicado.');
    await loadComentarios(0);
    return result;
  };

  const handleEdit = async (payload) => {
    const updated = await comentarioService.update(editing.id, payload);
    setEditing(null);
    setMessage('Comentário editado.');
    setComentarios((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
    return updated;
  };

  const handleDelete = async (comentario) => {
    if (!window.confirm('Excluir comentário?')) return;

    await comentarioService.deleteById(comentario.id);
    setMessage('Comentário excluído.');
    await loadComentarios(page);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Painel', to: '/' }, { label: 'Comentários' }]} />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Comentários</h1>
            <p className={styles.sub}>Postagens gerais da plataforma.</p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => loadComentarios(page)}>
              Listar comentários
            </button>
            <FormModal
              title="Publicar comentário"
              triggerLabel="Publicar comentário"
              submitLabel="POST /comentario"
              fields={fields}
              disabled={!auth?.email}
              disabledTitle="Faça login para comentar"
              onSubmit={handleCreate}
            />
          </div>
        </header>

        {message && <p className={styles.message}>{message}</p>}

        {loading ? (
          <LoadingSpinner message="Carregando comentários..." />
        ) : comentarios.length === 0 ? (
          <EmptyState icon="💬" title="Nenhum comentário" />
        ) : (
          <div className={styles.list}>
            {comentarios.map((comentario) => (
              <article key={comentario.id} className={styles.card}>
                <p className={styles.text}>{comentario.comentario}</p>
                <p className={styles.meta}>
                  {comentarioService.getMaterialId(comentario) ? `Material #${comentarioService.getMaterialId(comentario)} · ` : ''}
                  {comentario.nomeUsuario ?? comentario.emailUsuario ?? 'Usuário'} · {comentario.curtidas ?? 0} curtidas
                </p>
                <div className={styles.cardActions}>
                  <button className={styles.secondaryBtn} type="button" onClick={() => setEditing(comentario)} disabled={!auth?.email}>
                    Editar
                  </button>
                  <button className={styles.dangerBtn} type="button" onClick={() => handleDelete(comentario)} disabled={!auth?.email}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.secondaryBtn} disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
              Anterior
            </button>
            <span>Página {page + 1} de {totalPages}</span>
            <button className={styles.secondaryBtn} disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
              Próxima
            </button>
          </div>
        )}

        <FormModal
          title="Editar comentário"
          submitLabel="PUT /comentario/{id}"
          fields={updateFields}
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          onSubmit={handleEdit}
        />
      </div>
    </div>
  );
}
