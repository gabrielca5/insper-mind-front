import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { comentarioService } from '../services/comentarioService';
import { cursoService } from '../services/cursoService';
import { disciplinaService } from '../services/disciplinaService';
import { docenteService } from '../services/docenteService';
import { eletivaService } from '../services/eletivaService';
import { favoritoService } from '../services/favoritoService';
import { materialService } from '../services/materialService';
import { semestreService } from '../services/semestreService';
import { usuarioService } from '../services/usuarioService';
import styles from './ApiRoutes.module.css';

// br.insper.insperMind.material.TipoMaterial
const TipoMaterial = {
  PROVA_ANTIGA: 'PROVA_ANTIGA',
  RESUMO: 'RESUMO',
  EXERCICIO_RESOLVIDO: 'EXERCICIO_RESOLVIDO',
  LISTA: 'LISTA',
  PDF: 'PDF',
  LIVRO: 'LIVRO',
};

const resources = [
  {
    key: 'usuarios',
    title: 'Usuários',
    endpoint: '/usuario',
    list: usuarioService.list,
    getLabel: 'Email',
    get: usuarioService.getByEmail,
    create: usuarioService.save,
    createTemplate: { nome: '', email: '', senha: '' },
    updateLabel: 'Email',
    updateMethod: 'PATCH',
    update: usuarioService.update,
    updateTemplate: { nome: '', senha: '', email: '' },
    deleteLabel: 'ID',
    delete: usuarioService.deleteById,
    actions: [
      {
        key: 'login',
        title: 'Login',
        label: 'POST /usuario/login',
        template: { email: '', senha: '' },
        run: usuarioService.login,
      },
    ],
  },
  {
    key: 'docentes',
    title: 'Docentes',
    endpoint: '/docente',
    list: docenteService.list,
    getLabel: 'Email',
    get: docenteService.getByEmail,
    create: docenteService.save,
    createTemplate: { nome: '', email: '' },
    updateLabel: 'Email',
    updateMethod: 'PATCH',
    update: docenteService.update,
    updateTemplate: { nome: '', email: '' },
    deleteLabel: 'ID',
    delete: docenteService.deleteById,
  },
  {
    key: 'cursos',
    title: 'Cursos',
    endpoint: '/curso',
    list: cursoService.listPage,
    getLabel: 'ID',
    get: cursoService.getById,
    create: cursoService.save,
    createTemplate: { nome: '' },
    updateLabel: 'ID',
    updateMethod: 'PUT',
    update: cursoService.update,
    updateTemplate: { nome: '', ativo: true },
    deleteLabel: 'ID',
    delete: cursoService.deleteById,
  },
  {
    key: 'disciplinas',
    title: 'Disciplinas',
    endpoint: '/disciplina',
    list: disciplinaService.listPage,
    getLabel: 'ID',
    get: disciplinaService.getById,
    create: disciplinaService.save,
    createTemplate: {
      nome: '',
      formulaAvaliacao: '',
      temDelta: false,
      criterioBarreira: '',
    },
    updateLabel: 'ID',
    updateMethod: 'PUT',
    update: disciplinaService.update,
    updateTemplate: {
      nome: '',
      formulaAvaliacao: '',
      temDelta: false,
      criterioBarreira: '',
    },
    deleteLabel: 'ID',
    delete: disciplinaService.deleteById,
  },
  {
    key: 'materiais',
    title: 'Materiais',
    endpoint: '/material',
    list: materialService.listPage,
    getLabel: 'ID',
    get: materialService.getById,
    create: materialService.save,
    createTemplate: {
      titulo: '',
      descricao: '',
      link: '',
      tipo: TipoMaterial.PDF,
      emailUsuario: '',
      cursoId: 1,
    },
    updateLabel: 'ID',
    updateMethod: 'PUT',
    update: materialService.update,
    updateTemplate: {
      titulo: '',
      descricao: '',
      link: '',
      tipo: TipoMaterial.PDF,
      cursoId: 1,
      ativo: true,
    },
    deleteLabel: 'ID',
    delete: materialService.deleteById,
  },
  {
    key: 'semestres',
    title: 'Semestres',
    endpoint: '/semestre',
    list: semestreService.listPage,
    getLabel: 'ID',
    get: semestreService.getById,
    create: semestreService.save,
    createTemplate: { nome: '' },
    updateLabel: 'ID',
    updateMethod: 'PUT',
    update: semestreService.update,
    updateTemplate: { nome: '', ativo: true },
    deleteLabel: 'ID',
    delete: semestreService.deleteById,
  },
  {
    key: 'eletivas',
    title: 'Eletivas',
    endpoint: '/eletivas',
    list: eletivaService.listPage,
    getLabel: 'ID',
    get: eletivaService.getById,
    create: eletivaService.save,
    createTemplate: {
      cargaHoraria: 80,
      semestreMinimo: '',
      ativo: true,
    },
    updateLabel: 'ID',
    updateMethod: 'PUT',
    update: eletivaService.update,
    updateTemplate: {
      cargaHoraria: 80,
      semestreMinimo: '',
    },
    deleteLabel: 'ID',
    delete: eletivaService.deleteById,
  },
  {
    key: 'favoritos',
    title: 'Favoritos',
    endpoint: '/favorito',
    list: favoritoService.listPage,
    create: favoritoService.save,
    createTemplate: {
      emailUsuario: '',
      itemId: 1,
      tipoItem: 'MATERIAL',
    },
    deleteLabel: 'ID',
    delete: favoritoService.deleteById,
  },
  {
    key: 'comentarios',
    title: 'Comentários',
    endpoint: '/comentario',
    list: comentarioService.listPage,
    create: comentarioService.save,
    createTemplate: {
      comentario: '',
      emailUsuario: '',
    },
    updateLabel: 'ID',
    updateMethod: 'PUT',
    update: comentarioService.update,
    updateTemplate: {
      comentario: '',
      ativo: true,
    },
    deleteLabel: 'ID',
    delete: comentarioService.deleteById,
    actions: [
      {
        key: 'curtir',
        title: 'Curtir comentário',
        label: 'PATCH /comentario/{id}/curtir',
        keyLabel: 'ID',
        run: comentarioService.curtir,
      },
    ],
  },
];

const resourcesByKey = Object.fromEntries(resources.map((resource) => [resource.key, resource]));

function getPostOperations() {
  return resources.flatMap((resource) =>
    getOperations(resource)
      .filter((operation) => operation.method === 'POST')
      .map((operation) => ({
        ...operation,
        resourceKey: resource.key,
        resourceTitle: resource.title,
      }))
  );
}

function getOperations(resource) {
  const operations = [
    { id: 'listar', method: 'GET', label: `GET ${resource.endpoint}` },
  ];

  if (resource.get) {
    operations.push({
      id: 'buscar',
      method: 'GET',
      label: `GET ${resource.endpoint}/{${resource.getLabel.toLowerCase()}}`,
    });
  }

  if (resource.create) {
    operations.push({
      id: 'criar',
      method: 'POST',
      label: `POST ${resource.endpoint}`,
    });
  }

  if (resource.update) {
    operations.push({
      id: 'editar',
      method: resource.updateMethod,
      label: `${resource.updateMethod} ${resource.endpoint}/{${resource.updateLabel.toLowerCase()}}`,
    });
  }

  if (resource.delete) {
    operations.push({
      id: 'excluir',
      method: 'DELETE',
      label: `DELETE ${resource.endpoint}/{id}`,
    });
  }

  resource.actions?.forEach((action) => {
    operations.push({
      id: action.key,
      method: action.label.split(' ')[0],
      label: action.label,
    });
  });

  return operations;
}

function stringify(value) {
  return JSON.stringify(value, null, 2);
}

function parseJson(value) {
  try {
    return { data: JSON.parse(value), error: null };
  } catch {
    return { data: null, error: 'JSON inválido.' };
  }
}

function normalizePage(result) {
  const items = result?.items ?? result?.content ?? (Array.isArray(result) ? result : []);

  return {
    items,
    totalPages: result?.totalPages ?? (items.length > 0 ? 1 : 0),
    totalElements: result?.totalElements ?? items.length,
    number: result?.number ?? 0,
  };
}

function itemTitle(item) {
  return item?.nome || item?.titulo || item?.email || item?.comentario || `Registro #${item?.id ?? '-'}`;
}

function itemSubtitle(item) {
  const parts = [
    item?.id !== undefined ? `id: ${item.id}` : null,
    item?.emailUsuario || item?.email || null,
    item?.tipo || item?.tipoItem || null,
  ].filter(Boolean);

  return parts.join(' · ');
}

function ResourceIndex() {
  const postOperations = getPostOperations();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Painel', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Rotas' }]} />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Rotas da API</h1>
            <p className={styles.sub}>Telas básicas para chamar os endpoints do Swagger.</p>
          </div>
          <nav className={styles.adminNav} aria-label="Subáreas admin">
            <Link className={styles.adminNavLink} to="/admin">
              CRUD
            </Link>
            <Link className={`${styles.adminNavLink} ${styles.active}`} to="/admin/rotas">
              Rotas da API
            </Link>
          </nav>
        </header>

        <section className={styles.postPanel}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Botões POST</h2>
            <span className={styles.count}>{postOperations.length} rotas</span>
          </div>
          <div className={styles.postButtons}>
            {postOperations.map((operation) => (
              <Link
                key={`${operation.resourceKey}-${operation.id}`}
                to={`/admin/rotas/${operation.resourceKey}#${operation.id}`}
                className={`${styles.operationBtn} ${styles.postBtn}`}
              >
                <span className={styles.method}>POST</span>
                <span>{operation.label.replace('POST ', '')}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className={styles.resourceGrid}>
          {resources.map((resource) => (
            <article key={resource.key} className={styles.resourceCard}>
              <div className={styles.resourceHead}>
                <Link to={`/admin/rotas/${resource.key}`} className={styles.resourceTitle}>
                  {resource.title}
                </Link>
                <code className={styles.endpoint}>{resource.endpoint}</code>
              </div>
              <div className={styles.operationList}>
                {getOperations(resource).map((operation) => (
                  <Link
                    key={operation.id}
                    to={`/admin/rotas/${resource.key}#${operation.id}`}
                    className={styles.operationBtn}
                  >
                    <span className={styles.method}>{operation.method}</span>
                    <span>{operation.label.replace(`${operation.method} `, '')}</span>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function JsonForm({ id, title, endpoint, body, setBody, onSubmit, busy }) {
  const buttonLabel = endpoint.startsWith('POST') ? endpoint : 'Enviar';

  return (
    <section id={id} className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <code className={styles.endpoint}>{endpoint}</code>
      </div>
      <textarea
        className={styles.textarea}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        spellCheck="false"
      />
      <button className={styles.btnPrimary} onClick={onSubmit} disabled={busy}>
        {buttonLabel}
      </button>
    </section>
  );
}

function KeyAction({ id, title, endpoint, label, value, setValue, onSubmit, busy, danger = false }) {
  return (
    <section id={id} className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <code className={styles.endpoint}>{endpoint}</code>
      </div>
      <div className={styles.inlineForm}>
        <label className={styles.label}>
          <span>{label}</span>
          <input
            className={styles.input}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <button
          className={danger ? styles.btnDanger : styles.btnPrimary}
          onClick={onSubmit}
          disabled={busy || !value.trim()}
        >
          Executar
        </button>
      </div>
    </section>
  );
}

function ResourceCrud({ resource }) {
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [listData, setListData] = useState({ items: [], totalPages: 0, totalElements: 0 });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [getValue, setGetValue] = useState('');
  const [updateValue, setUpdateValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [createBody, setCreateBody] = useState(stringify(resource.createTemplate ?? {}));
  const [updateBody, setUpdateBody] = useState(stringify(resource.updateTemplate ?? {}));
  const [actionStates, setActionStates] = useState({});

  const pageInfo = useMemo(() => normalizePage(listData), [listData]);
  const operations = useMemo(() => getOperations(resource), [resource]);

  useEffect(() => {
    setPage(0);
    setGetValue('');
    setUpdateValue('');
    setDeleteValue('');
    setCreateBody(stringify(resource.createTemplate ?? {}));
    setUpdateBody(stringify(resource.updateTemplate ?? {}));
    setActionStates({});
    setResult(null);
    setStatus('');
    setError('');
  }, [resource]);

  const loadList = async (nextPage = page) => {
    setBusy(true);
    setError('');
    try {
      const response = await resource.list(nextPage, 20);
      setListData(normalizePage(response));
      setStatus(`Lista carregada: ${resource.endpoint}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao listar.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, page]);

  useEffect(() => {
    if (!location.hash) return;

    window.requestAnimationFrame(() => {
      document
        .getElementById(location.hash.replace('#', ''))
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash]);

  const run = async (action, successMessage, refresh = false) => {
    setBusy(true);
    setError('');
    setStatus('');
    try {
      const response = await action();
      setResult(response ?? { ok: true });
      setStatus(successMessage);
      if (refresh) {
        const listResponse = await resource.list(page, 20);
        setListData(normalizePage(listResponse));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erro na chamada.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = () => {
    const parsed = parseJson(createBody);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    run(() => resource.create(parsed.data), `POST ${resource.endpoint} executado.`, true);
  };

  const handleUpdate = () => {
    const parsed = parseJson(updateBody);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    run(
      () => resource.update(updateValue.trim(), parsed.data),
      `Atualização em ${resource.endpoint}/{id} executada.`,
      true
    );
  };

  const handleDelete = () => {
    const value = deleteValue.trim();
    if (!window.confirm(`Excluir registro ${value}?`)) return;
    run(() => resource.delete(value), `DELETE ${resource.endpoint}/{id} executado.`, true);
  };

  const setActionState = (key, patch) => {
    setActionStates((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? {}),
        ...patch,
      },
    }));
  };

  const handleExtraAction = (action) => {
    const state = actionStates[action.key] ?? {};

    if (action.template) {
      const parsed = parseJson(state.body ?? stringify(action.template));
      if (parsed.error) {
        setError(parsed.error);
        return;
      }
      run(() => action.run(parsed.data), `${action.label} executado.`);
      return;
    }

    run(() => action.run((state.value ?? '').trim()), `${action.label} executado.`, true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.innerWide}>
        <Breadcrumb
          items={[
            { label: 'Painel', to: '/' },
            { label: 'Admin', to: '/admin' },
            { label: 'Rotas', to: '/admin/rotas' },
            { label: resource.title },
          ]}
        />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{resource.title}</h1>
            <p className={styles.sub}>Chamadas básicas para <code>{resource.endpoint}</code>.</p>
          </div>
          <nav className={styles.adminNav} aria-label="Subáreas admin">
            <Link className={styles.adminNavLink} to="/admin">
              CRUD
            </Link>
            <Link className={`${styles.adminNavLink} ${styles.active}`} to="/admin/rotas">
              Rotas da API
            </Link>
          </nav>
        </header>

        <nav className={styles.routeButtons} aria-label="Rotas do Swagger">
          {operations.map((operation) => (
            <Link
              key={operation.id}
              to={`${location.pathname}#${operation.id}`}
              className={styles.operationBtn}
            >
              <span className={styles.method}>{operation.method}</span>
              <span>{operation.label.replace(`${operation.method} `, '')}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.toolbar}>
          <button className={styles.btnSecondary} onClick={() => loadList(page)} disabled={busy}>
            Recarregar lista
          </button>
          {status && <span className={styles.status}>{status}</span>}
          {error && <span className={styles.error}>{error}</span>}
        </div>

        <div className={styles.layout}>
          <section id="listar" className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Listar</h2>
              <code className={styles.endpoint}>GET {resource.endpoint}</code>
            </div>

            {pageInfo.items.length === 0 ? (
              <p className={styles.empty}>Nenhum registro retornado.</p>
            ) : (
              <div className={styles.list}>
                {pageInfo.items.map((item, index) => (
                  <article key={item?.id ?? item?.email ?? index} className={styles.record}>
                    <strong>{itemTitle(item)}</strong>
                    {itemSubtitle(item) && <span>{itemSubtitle(item)}</span>}
                  </article>
                ))}
              </div>
            )}

            <div className={styles.pagination}>
              <button
                className={styles.btnSecondary}
                disabled={busy || page === 0}
                onClick={() => setPage((current) => current - 1)}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {page + 1} de {Math.max(pageInfo.totalPages, 1)}
              </span>
              <button
                className={styles.btnSecondary}
                disabled={busy || page >= pageInfo.totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
              >
                Próxima
              </button>
            </div>
          </section>

          {resource.get && (
            <KeyAction
              id="buscar"
              title="Buscar"
              endpoint={`GET ${resource.endpoint}/{${resource.getLabel.toLowerCase()}}`}
              label={resource.getLabel}
              value={getValue}
              setValue={setGetValue}
              busy={busy}
              onSubmit={() =>
                run(
                  () => resource.get(getValue.trim()),
                  `GET ${resource.endpoint}/{${resource.getLabel.toLowerCase()}} executado.`
                )
              }
            />
          )}

          {resource.create && (
            <JsonForm
              id="criar"
              title="Criar"
              endpoint={`POST ${resource.endpoint}`}
              body={createBody}
              setBody={setCreateBody}
              busy={busy}
              onSubmit={handleCreate}
            />
          )}

          {resource.update && (
            <section id="editar" className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Editar</h2>
                <code className={styles.endpoint}>
                  {resource.updateMethod} {resource.endpoint}/{'{'}{resource.updateLabel.toLowerCase()}{'}'}
                </code>
              </div>
              <label className={styles.label}>
                <span>{resource.updateLabel}</span>
                <input
                  className={styles.input}
                  value={updateValue}
                  onChange={(event) => setUpdateValue(event.target.value)}
                />
              </label>
              <textarea
                className={styles.textarea}
                value={updateBody}
                onChange={(event) => setUpdateBody(event.target.value)}
                spellCheck="false"
              />
              <button
                className={styles.btnPrimary}
                onClick={handleUpdate}
                disabled={busy || !updateValue.trim()}
              >
                Enviar edição
              </button>
            </section>
          )}

          {resource.delete && (
            <KeyAction
              id="excluir"
              title="Excluir"
              endpoint={`DELETE ${resource.endpoint}/{id}`}
              label={resource.deleteLabel}
              value={deleteValue}
              setValue={setDeleteValue}
              busy={busy}
              danger
              onSubmit={handleDelete}
            />
          )}

          {resource.actions?.map((action) => {
            const state = actionStates[action.key] ?? {};

            if (action.template) {
              return (
                <JsonForm
                  key={action.key}
                  id={action.key}
                  title={action.title}
                  endpoint={action.label}
                  body={state.body ?? stringify(action.template)}
                  setBody={(body) => setActionState(action.key, { body })}
                  busy={busy}
                  onSubmit={() => handleExtraAction(action)}
                />
              );
            }

            return (
              <KeyAction
                key={action.key}
                id={action.key}
                title={action.title}
                endpoint={action.label}
                label={action.keyLabel}
                value={state.value ?? ''}
                setValue={(value) => setActionState(action.key, { value })}
                busy={busy}
                onSubmit={() => handleExtraAction(action)}
              />
            );
          })}
        </div>

        {result && (
          <section className={styles.result}>
            <h2 className={styles.sectionTitle}>Última resposta</h2>
            <pre>{stringify(result)}</pre>
          </section>
        )}
      </div>
    </div>
  );
}

export function ApiRoutes() {
  const { resourceKey } = useParams();

  if (!resourceKey) {
    return <ResourceIndex />;
  }

  const resource = resourcesByKey[resourceKey];

  if (!resource) {
    return <Navigate to="/admin/rotas" replace />;
  }

  return <ResourceCrud resource={resource} />;
}
