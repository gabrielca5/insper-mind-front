import { useCallback, useEffect, useMemo, useState } from 'react';
import { materialService, SUPPORTED_MATERIAL_TYPES } from '../services/materialService';
import { cursoService } from '../services/cursoService';
import { favoritoService } from '../services/favoritoService';
import { readAuth } from '../services/authStorage';
import { useAuth } from '../hooks/useAuth';
import { FormModal } from '../components/FormModal';
import { MaterialCard } from '../components/MaterialCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import styles from './Materiais.module.css';

const TIPOS = ['TODOS', ...SUPPORTED_MATERIAL_TYPES];

function materialFields(auth, cursos, material = {}) {
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
    {
      name: 'emailUsuario',
      label: 'Email do usuário',
      type: 'email',
      required: true,
      disabled: Boolean(auth?.email),
      defaultValue: material.emailUsuario ?? auth?.email ?? '',
    },
  ];
}

function editMaterialFields(cursos, material = {}) {
  return materialFields(null, cursos, material)
    .filter((field) => field.name !== 'emailUsuario')
    .concat({ name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: material.ativo ?? true });
}

export function Materiais() {
  const auth = useAuth();
  const [materiais, setMateriais] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [favoritos, setFavoritos] = useState({});
  const [filtro, setFiltro] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingMaterial, setEditingMaterial] = useState(null);

  const loadFavoritos = useCallback(async () => {
    const currentAuth = readAuth();
    if (!currentAuth?.email) {
      setFavoritos({});
      return;
    }

    const data = await favoritoService.listByUsuario(currentAuth.email);
    const map = {};
    data.forEach((favorito) => {
      if (favorito.tipoItem === 'MATERIAL' || !favorito.tipoItem) {
        map[favorito.itemId] = favorito.id;
      }
    });
    setFavoritos(map);
  }, []);

  const loadMateriais = useCallback(async () => {
    setLoading(true);
    const [materialData, cursoData] = await Promise.all([
      materialService.list(),
      cursoService.list(),
    ]);
    setMateriais(materialData);
    setCursos(cursoData);
    await loadFavoritos();
    setLoading(false);
  }, [loadFavoritos]);

  useEffect(() => {
    loadMateriais();
  }, [loadMateriais]);

  useEffect(() => {
    loadFavoritos();
  }, [auth?.email, loadFavoritos]);

  const filtrados = filtro === 'TODOS'
    ? materiais
    : materiais.filter((m) => m.tipo === filtro);

  const createFields = useMemo(() => materialFields(auth, cursos), [auth, cursos]);
  const editFields = useMemo(() => editMaterialFields(cursos, editingMaterial ?? {}), [cursos, editingMaterial]);

  const handleCreateMaterial = async (payload) => {
    const material = await materialService.save(payload);
    setMessage('Material enviado.');
    await loadMateriais();
    return material;
  };

  const handleEditMaterial = async (payload) => {
    const material = await materialService.update(editingMaterial.id, payload);
    setMessage('Material editado.');
    setEditingMaterial(null);
    await loadMateriais();
    return material;
  };

  const handleDeleteMaterial = async (material) => {
    if (!window.confirm(`Excluir "${material.titulo}"?`)) return;
    await materialService.deleteById(material.id);
    setMessage('Material excluído.');
    await loadMateriais();
  };

  const handleFavorite = async (material) => {
    if (!auth?.email) {
      setMessage('Faça login para favoritar.');
      return;
    }

    if (!material?.id) {
      setMessage('Não foi possível favoritar: material sem ID.');
      return;
    }

    const favoriteId = favoritos[material.id];
    if (favoriteId) {
      await favoritoService.deleteById(favoriteId);
      setMessage('Favorito removido.');
    } else {
      const favorito = await favoritoService.save({
        emailUsuario: auth.email,
        itemId: material.id,
        tipoItem: 'MATERIAL',
      });
      setFavoritos((current) => ({ ...current, [material.id]: favorito.id }));
      setMessage('Material favoritado.');
    }

    await loadFavoritos();
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Catálogo', to: '/' }, { label: 'Materiais' }]} />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Materiais Acadêmicos</h1>
            <p className={styles.sub}>PDFs, vídeos, slides e outros recursos de estudo</p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryBtn} onClick={loadMateriais}>
              Recarregar materiais
            </button>
            <FormModal
              title="Enviar material"
              triggerLabel="Enviar material"
              submitLabel="POST /material"
              fields={createFields}
              disabled={!auth?.email}
              disabledTitle="Faça login para enviar material"
              onSubmit={handleCreateMaterial}
            />
          </div>
        </header>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.filters}>
          {TIPOS.map((t) => (
            <button
              key={t}
              className={`${styles.filterBtn} ${filtro === t ? styles.active : ''}`}
              onClick={() => setFiltro(t)}
            >
              {t === 'TODOS' ? 'Todos' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Carregando materiais..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Nenhum material encontrado"
            subtitle={filtro !== 'TODOS' ? `Sem materiais do tipo "${filtro}"` : undefined}
          />
        ) : (
          <div className={styles.list}>
            {filtrados.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                canFavorite={Boolean(auth?.email)}
                canManage={Boolean(auth?.email)}
                isFavorite={Boolean(favoritos[m.id])}
                onFavorite={handleFavorite}
                onEdit={setEditingMaterial}
                onDelete={handleDeleteMaterial}
              />
            ))}
          </div>
        )}

        <FormModal
          title="Editar material"
          submitLabel="PUT /material/{id}"
          fields={editFields}
          open={Boolean(editingMaterial)}
          onOpenChange={(open) => {
            if (!open) setEditingMaterial(null);
          }}
          onSubmit={handleEditMaterial}
        />
      </div>
    </div>
  );
}
