import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { FormModal } from '../components/FormModal';
import { LoadingSpinner, EmptyState } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import { comentarioService } from '../services/comentarioService';
import { cursoService } from '../services/cursoService';
import { favoritoService } from '../services/favoritoService';
import { materialService, SUPPORTED_MATERIAL_TYPES } from '../services/materialService';
import styles from './MaterialDetalhe.module.css';

function materialFields(cursos, material = {}) {
  const cursoOptions = cursos.map((curso) => ({
    value: curso.id,
    label: curso.nome,
  }));

  return [
    { name: 'titulo', label: 'Título', required: true, defaultValue: material.titulo ?? '' },
    { name: 'descricao', label: 'Descrição', type: 'textarea', defaultValue: material.descricao ?? '' },
    { name: 'link', label: 'Link', type: 'url', required: true, defaultValue: material.link ?? '' },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      defaultValue: material.tipo ?? SUPPORTED_MATERIAL_TYPES[0],
      options: SUPPORTED_MATERIAL_TYPES.map((tipo) => ({ value: tipo, label: tipo })),
    },
    {
      name: 'cursoId',
      label: 'Curso',
      type: 'select',
      valueType: 'number',
      required: true,
      defaultValue: material.cursoId ?? cursoOptions[0]?.value ?? '',
      options: cursoOptions,
    },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: material.ativo ?? true },
  ];
}

function commentFields(auth, materialId, comentario = {}) {
  return [
    {
      name: 'materialId',
      type: 'hidden',
      defaultValue: Number(materialId),
    },
    {
      name: 'comentario',
      label: 'Comentário',
      type: 'textarea',
      required: true,
      defaultValue: comentario.comentario ?? '',
    },
    {
      name: 'emailUsuario',
      label: 'Email do usuário',
      type: 'email',
      required: true,
      disabled: Boolean(auth?.email),
      defaultValue: comentario.emailUsuario ?? auth?.email ?? '',
    },
  ];
}

function editCommentFields(comentario = {}) {
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

export function MaterialDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [material, setMaterial] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingMaterial, setEditingMaterial] = useState(false);
  const [editingComment, setEditingComment] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [mat, comments, cursoData] = await Promise.all([
      materialService.getById(id),
      comentarioService.listByMaterial(id),
      cursoService.list(),
    ]);

    setMaterial(mat);
    setComentarios(comments ?? []);
    setCursos(cursoData);

    if (auth?.email) {
      const favorites = await favoritoService.listByUsuario(auth.email);
      const favorite = favorites.find((item) => Number(favoritoService.getItemId(item)) === Number(id));
      setFavoriteId(favorite?.id ?? null);
    } else {
      setFavoriteId(null);
    }

    setLoading(false);
  }, [auth?.email, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const editMaterialFields = useMemo(() => materialFields(cursos, material ?? {}), [cursos, material]);
  const newCommentFields = useMemo(() => commentFields(auth, id), [auth, id]);
  const updateCommentFields = useMemo(() => editCommentFields(editingComment ?? {}), [editingComment]);

  const handleFavorite = async () => {
    if (!auth?.email || !material?.id) {
      setMessage('Faça login para favoritar.');
      return;
    }

    if (favoriteId) {
      await favoritoService.deleteById(favoriteId, {
        emailUsuario: auth.email,
        itemId: material.id,
        tipoItem: 'MATERIAL',
      });
      setFavoriteId(null);
      setMessage('Favorito removido.');
      return;
    }

    const favorito = await favoritoService.save({
      emailUsuario: auth.email,
      itemId: material.id,
      tipoItem: 'MATERIAL',
    });
    setFavoriteId(favorito.id);
    setMessage('Material favoritado.');
  };

  const handleEditMaterial = async (payload) => {
    const updated = await materialService.update(id, payload);
    setMaterial(updated);
    setEditingMaterial(false);
    setMessage('Material editado.');
    return updated;
  };

  const handleDeleteMaterial = async () => {
    if (!window.confirm('Excluir este material?')) return;

    await materialService.deleteById(id);
    navigate('/materiais');
  };

  const handleCreateComment = async (payload) => {
    const comentario = await comentarioService.save(payload);
    setMessage('Comentário publicado.');
    await loadData();
    return comentario;
  };

  const handleEditComment = async (payload) => {
    const updated = await comentarioService.update(editingComment.id, payload);
    setEditingComment(null);
    setMessage('Comentário editado.');
    setComentarios((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
    return updated;
  };

  const handleDeleteComment = async (comentario) => {
    if (!window.confirm('Excluir comentário?')) return;

    await comentarioService.deleteById(comentario.id);
    setMessage('Comentário excluído.');
    await loadData();
  };

  if (loading) return <LoadingSpinner message="Carregando material..." />;
  if (!material) return (
    <div className={styles.page}>
      <EmptyState icon="📦" title="Material não encontrado" />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[
          { label: 'Painel', to: '/' },
          { label: 'Materiais', to: '/materiais' },
          { label: material.titulo ?? 'Material' },
        ]} />

        <header className={styles.header}>
          <div>
            <span className={styles.badge}>{material.tipo ?? 'Material'}</span>
            <h1 className={styles.title}>{material.titulo}</h1>
            {material.descricao && <p className={styles.desc}>{material.descricao}</p>}
          </div>
          <div className={styles.actions}>
            {material.link && (
              <a className={styles.primaryLink} href={material.link} target="_blank" rel="noreferrer">
                Acessar link
              </a>
            )}
            <button className={styles.secondaryBtn} type="button" onClick={handleFavorite} disabled={!auth?.email}>
              {favoriteId ? 'Remover favorito' : 'Favoritar'}
            </button>
            <button className={styles.secondaryBtn} type="button" onClick={() => setEditingMaterial(true)} disabled={!auth?.email}>
              Editar material
            </button>
            <button className={styles.dangerBtn} type="button" onClick={handleDeleteMaterial} disabled={!auth?.email}>
              Excluir material
            </button>
          </div>
        </header>

        {message && <p className={styles.message}>{message}</p>}

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Comentários deste material</h2>
            <FormModal
              title="Publicar comentário"
              triggerLabel="Publicar comentário"
              submitLabel="POST /comentario"
              fields={newCommentFields}
              disabled={!auth?.email}
              disabledTitle="Faça login para comentar"
              onSubmit={handleCreateComment}
            />
          </div>

          {comentarios.length === 0 ? (
            <EmptyState icon="💬" title="Nenhum comentário" />
          ) : (
            <div className={styles.comments}>
              {comentarios.map((comentario) => (
                <article key={comentario.id} className={styles.comment}>
                  <p className={styles.commentText}>{comentario.comentario}</p>
                  <p className={styles.commentMeta}>
                    {comentario.nomeUsuario ?? comentario.emailUsuario ?? 'Usuário'} · {comentario.curtidas ?? 0} curtidas
                  </p>
                  <div className={styles.commentActions}>
                    <button className={styles.secondaryBtn} type="button" onClick={() => setEditingComment(comentario)} disabled={!auth?.email}>
                      Editar
                    </button>
                    <button className={styles.dangerBtn} type="button" onClick={() => handleDeleteComment(comentario)} disabled={!auth?.email}>
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <FormModal
          title="Editar material"
          submitLabel="PUT /material/{id}"
          fields={editMaterialFields}
          open={editingMaterial}
          onOpenChange={setEditingMaterial}
          onSubmit={handleEditMaterial}
        />

        <FormModal
          title="Editar comentário"
          submitLabel="PUT /comentario/{id}"
          fields={updateCommentFields}
          open={Boolean(editingComment)}
          onOpenChange={(open) => {
            if (!open) setEditingComment(null);
          }}
          onSubmit={handleEditComment}
        />
      </div>
    </div>
  );
}
