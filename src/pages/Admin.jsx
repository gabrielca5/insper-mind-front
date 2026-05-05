import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ThumbsUp, MessageCircle, Eye, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { FormModal } from '../components/FormModal';
import { cursoService } from '../services/cursoService';
import { disciplinaService } from '../services/disciplinaService';
import { docenteService } from '../services/docenteService';
import { eletivaService } from '../services/eletivaService';
import { semestreService } from '../services/semestreService';
import { usuarioService } from '../services/usuarioService';
import styles from './Admin.module.css';

const resources = [
  {
    key: 'usuarios',
    title: 'Usuários',
    endpoint: '/usuario',
    list: usuarioService.list,
    create: usuarioService.save,
    update: usuarioService.update,
    delete: usuarioService.deleteById,
    pathField: 'email',
    deleteField: 'id',
    fields: [
      { name: 'nome', label: 'Nome', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'senha', label: 'Senha', type: 'password' },
    ],
  },
  {
    key: 'docentes',
    title: 'Docentes',
    endpoint: '/docente',
    list: docenteService.list,
    create: docenteService.save,
    update: docenteService.update,
    delete: docenteService.deleteById,
    pathField: 'email',
    deleteField: 'id',
    fields: [
      { name: 'nome', label: 'Nome', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
    ],
  },
  {
    key: 'cursos',
    title: 'Cursos',
    endpoint: '/curso',
    list: cursoService.listPage,
    create: cursoService.save,
    update: cursoService.update,
    delete: cursoService.deleteById,
    pathField: 'id',
    deleteField: 'id',
    fields: [
      { name: 'nome', label: 'Nome', required: true },
      { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
    ],
    createFields: [{ name: 'nome', label: 'Nome', required: true }],
  },
  {
    key: 'disciplinas',
    title: 'Disciplinas',
    endpoint: '/disciplina',
    list: disciplinaService.listPage,
    create: disciplinaService.save,
    update: disciplinaService.update,
    delete: disciplinaService.deleteById,
    pathField: 'id',
    deleteField: 'id',
    fields: [
      { name: 'nome', label: 'Nome', required: true },
      { name: 'formulaAvaliacao', label: 'Fórmula de avaliação' },
      { name: 'temDelta', label: 'Tem delta', type: 'checkbox' },
      { name: 'criterioBarreira', label: 'Critério de barreira', type: 'textarea' },
    ],
  },
  {
    key: 'semestres',
    title: 'Semestres',
    endpoint: '/semestre',
    list: semestreService.listPage,
    create: semestreService.save,
    update: semestreService.update,
    delete: semestreService.deleteById,
    pathField: 'id',
    deleteField: 'id',
    fields: [
      { name: 'nome', label: 'Nome', required: true },
      { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
    ],
    createFields: [{ name: 'nome', label: 'Nome', required: true }],
  },
  {
    key: 'eletivas',
    title: 'Eletivas',
    endpoint: '/eletivas',
    list: eletivaService.listPage,
    create: eletivaService.save,
    update: eletivaService.update,
    delete: eletivaService.deleteById,
    pathField: 'id',
    deleteField: 'id',
    fields: [
      { name: 'cargaHoraria', label: 'Carga horária', type: 'number', required: true },
      { name: 'semestreMinimo', label: 'Semestre mínimo', required: true },
      { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
    ],
    updateFields: [
      { name: 'cargaHoraria', label: 'Carga horária', type: 'number', required: true },
      { name: 'semestreMinimo', label: 'Semestre mínimo', required: true },
    ],
  },
];

function normalizePage(data) {
  if (Array.isArray(data)) return { items: data, totalPages: data.length ? 1 : 0 };
  return {
    items: data?.items ?? data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
  };
}

function buildFields(fields, item = {}) {
  return fields.map((field) => ({
    ...field,
    defaultValue: item[field.name] ?? field.defaultValue ?? (field.type === 'checkbox' ? false : ''),
  }));
}

function itemTitle(item) {
  return item.nome || item.titulo || item.email || `Registro #${item.id}`;
}

function AdminSection({ resource }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);

  const loadItems = useCallback(async (nextPage = page) => {
    setLoading(true);
    const response = await resource.list(nextPage, 20);
    const normalized = normalizePage(response);
    setItems(normalized.items);
    setTotalPages(normalized.totalPages);
    setLoading(false);
  }, [page, resource]);

  useEffect(() => {
    loadItems(page);
  }, [loadItems, page]);

  const createFields = useMemo(
    () => buildFields(resource.createFields ?? resource.fields),
    [resource]
  );
  const updateFields = useMemo(
    () => buildFields(resource.updateFields ?? resource.fields, editing ?? {}),
    [editing, resource]
  );

  const handleCreate = async (payload) => {
    const result = await resource.create(payload);
    setMessage(`${resource.title}: registro criado.`);
    await loadItems(0);
    return result;
  };

  const handleUpdate = async (payload) => {
    const key = editing?.[resource.pathField];
    const result = await resource.update(key, payload);
    setEditing(null);
    setMessage(`${resource.title}: registro editado.`);
    await loadItems(page);
    return result;
  };

  const handleDelete = async (item) => {
    const key = item?.[resource.deleteField];
    if (!key || !window.confirm(`Excluir ${itemTitle(item)}?`)) return;

    await resource.delete(key);
    setMessage(`${resource.title}: registro excluído.`);
    await loadItems(page);
  };

  const isMaterial = resource.key === 'materiais';
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>{resource.title}</h2>
          <code>{resource.endpoint}</code>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn} type="button" onClick={() => loadItems(page)}>
            Listar {resource.title.toLowerCase()}
          </button>
          <FormModal
            title={`Criar ${resource.title}`}
            triggerLabel={`Criar ${resource.title.toLowerCase()}`}
            submitLabel={`POST ${resource.endpoint}`}
            fields={createFields}
            onSubmit={handleCreate}
          />
        </div>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {loading ? (
        <p className={styles.empty}>Carregando...</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>Nenhum registro retornado.</p>
      ) : isMaterial ? (
        <div className={styles.galleryGrid}>
          {items.map((item) => (
            <article key={item.id} className={styles.galleryCard}>
              <div className={styles.galleryIconWrap}>
                <span className={styles.galleryIcon}>{/* PDF icon fallback */}📄</span>
              </div>
              <div className={styles.galleryBody}>
                <span className={styles.galleryBadge}>{item.tipo || 'PDF'}</span>
                <h3 className={styles.galleryTitle}>{item.titulo}</h3>
                {item.nomeCurso && <p className={styles.galleryMeta}>{item.nomeCurso}</p>}
              </div>
              <div className={styles.galleryActions}>
                <button className={styles.iconBtn} title="Salvar" aria-label="Salvar">
                  <Bookmark size={18} strokeWidth={2} />
                </button>
                <button className={styles.iconBtn} title="Curtir" aria-label="Curtir">
                  <ThumbsUp size={18} strokeWidth={2} />
                </button>
                <button className={styles.iconBtn} title="Comentar" aria-label="Comentar">
                  <MessageCircle size={18} strokeWidth={2} />
                </button>
                <Link to={`/materiais/${item.id}`} className={styles.iconBtn} title="Ver" aria-label="Ver">
                  <Eye size={18} strokeWidth={2} />
                </Link>
                {item.link && item.link !== '#' && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.iconBtn} title="Acessar" aria-label="Acessar">
                    <ExternalLink size={18} strokeWidth={2} />
                  </a>
                )}
                <button className={styles.iconBtn} title="Editar" aria-label="Editar" onClick={() => setEditing(item)}>
                  <Edit size={18} strokeWidth={2} />
                </button>
                <button className={styles.iconBtnDanger} title="Excluir" aria-label="Excluir" onClick={() => handleDelete(item)}>
                  <Trash2 size={18} strokeWidth={2} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <article key={item.id ?? item.email} className={styles.card}>
              <div>
                <h3 className={styles.cardTitle}>{itemTitle(item)}</h3>
                <p className={styles.meta}>
                  {item.id !== undefined ? `id ${item.id}` : ''}
                  {item.email ? ` · ${item.email}` : ''}
                </p>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.secondaryBtn} type="button" onClick={() => setEditing(item)}>
                  Editar
                </button>
                <button className={styles.dangerBtn} type="button" onClick={() => handleDelete(item)}>
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
        title={`Editar ${resource.title}`}
        submitLabel={`${resource.pathField === 'email' ? 'PATCH' : 'PUT'} ${resource.endpoint}/{${resource.pathField}}`}
        fields={updateFields}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSubmit={handleUpdate}
      />
    </section>
  );
}

export function Admin() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Painel', to: '/' }, { label: 'Admin' }]} />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin simples</h1>
            <p className={styles.sub}>CRUD básico com inputs reais para as rotas do Swagger.</p>
          </div>
          <nav className={styles.adminNav} aria-label="Subáreas admin">
            <Link className={`${styles.adminNavLink} ${styles.active}`} to="/admin">
              CRUD
            </Link>
            <Link className={styles.adminNavLink} to="/admin/rotas">
              Rotas da API
            </Link>
          </nav>
        </header>

        <div className={styles.sections}>
          {resources.map((resource) => (
            <AdminSection key={resource.key} resource={resource} />
          ))}
        </div>
      </div>
    </div>
  );
}
