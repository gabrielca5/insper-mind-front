import { useCallback, useEffect, useMemo, useState } from 'react';
import { materialService, SUPPORTED_MATERIAL_TYPES } from '../services/materialService';
import { disciplinaService } from '../services/disciplinaService';
import { favoritoService } from '../services/favoritoService';
import { readAuth } from '../services/authStorage';
import { useAuth } from '../hooks/useAuth';
import { FormModal } from '../components/FormModal';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner, EmptyState } from '../components/UI';
import { MaterialCard } from '../components/MaterialCard';
import { Search, Filter, RefreshCw, Plus } from 'lucide-react';
import styles from './Materiais.module.css';

const TIPOS = ['TODOS', ...SUPPORTED_MATERIAL_TYPES];

function disciplinaOptionLabel(disciplina) {
  return [
    disciplina.nome,
    disciplina.nomeCurso,
    disciplina.nomeSemestre,
  ].filter(Boolean).join(' · ');
}

function materialFields(auth, disciplinas, material = {}) {
  const disciplinaOptions = disciplinas.map((disciplina) => ({
    value: disciplina.id,
    label: disciplinaOptionLabel(disciplina),
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
      name: 'disciplinaId',
      label: 'Disciplina',
      type: 'select',
      valueType: 'number',
      required: true,
      defaultValue: material.disciplinaId ?? disciplinaOptions[0]?.value ?? '',
      options: disciplinaOptions,
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

function editMaterialFields(disciplinas, material = {}) {
  return materialFields(null, disciplinas, material).filter((field) => field.name !== 'emailUsuario');
}

export function Materiais() {
  const auth = useAuth();
  const [materiais, setMateriais] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [favoritos, setFavoritos] = useState({});
  const [filtro, setFiltro] = useState('TODOS');
  const [busca, setBusca] = useState('');
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
      if (favoritoService.getTipoItem(favorito) === 'MATERIAL') {
        const itemId = favoritoService.getItemId(favorito);
        if (itemId) {
          map[itemId] = favorito.id;
        }
      }
    });
    setFavoritos(map);
  }, []);

  const loadMateriais = useCallback(async () => {
    setLoading(true);
    const [materialData, disciplinaData] = await Promise.all([
      materialService.list(),
      disciplinaService.listPage(0, 250, 'nome,asc'),
    ]);
    setMateriais(materialData ?? []);
    setDisciplinas(disciplinaData.items ?? []);
    await loadFavoritos();
    setLoading(false);
  }, [loadFavoritos]);

  useEffect(() => {
    loadMateriais();
  }, [loadMateriais]);

  useEffect(() => {
    loadFavoritos();
  }, [auth?.email, loadFavoritos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return (filtro === 'TODOS' ? materiais : materiais.filter((m) => m.tipo === filtro))
      .filter((m) => {
        if (!termo) return true;
        const texto = [
          m.titulo,
          m.nome,
          m.descricao,
          m.nomeDisciplina,
          m.tipo,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return texto.includes(termo);
      });
  }, [materiais, filtro, busca]);

  const createFields = useMemo(() => materialFields(auth, disciplinas), [auth, disciplinas]);
  const editFields = useMemo(
    () => editMaterialFields(disciplinas, editingMaterial ?? {}),
    [disciplinas, editingMaterial]
  );

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
      setMessage('Faça login para salvar materiais.');
      return;
    }

    if (!material?.id) {
      setMessage('Não foi possível salvar: material sem ID.');
      return;
    }

    const favoriteId = favoritos[material.id];

    if (favoriteId) {
      await favoritoService.deleteById(favoriteId, {
        emailUsuario: auth.email,
        itemId: material.id,
        tipoItem: 'MATERIAL',
      });
      setFavoritos((current) => {
        const next = { ...current };
        delete next[material.id];
        return next;
      });
      setMessage('Material removido dos salvos.');
    } else {
      const favorito = await favoritoService.save({
        emailUsuario: auth.email,
        itemId: material.id,
        tipoItem: 'MATERIAL',
      });
      setMessage('Material salvo.');
      setFavoritos((current) => ({ ...current, [material.id]: favorito.id }));
    }

    await loadFavoritos();
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Painel', to: '/' }, { label: 'Materiais' }]} />

        <header>
          <div>
            <h1 className={styles.title}>Materiais Acadêmicos</h1>
            <p className={styles.sub}>
              Uma galeria para estudar, salvar e navegar rápido pelos recursos
            </p>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryBtn} onClick={loadMateriais}>
              <RefreshCw size={16} />
              Recarregar
            </button>

            <FormModal
              title="Enviar material"
              triggerLabel={
                <>
                  <Plus size={16} />
                  Enviar material
                </>
              }
              submitLabel="POST /material"
              fields={createFields}
              disabled={!auth?.email}
              disabledTitle="Faça login para enviar material"
              onSubmit={handleCreateMaterial}
            />
          </div>
        </header>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por titulo, disciplina, tipo..."
              aria-label="Buscar materiais"
            />
          </div>

          <div className={styles.filters}>
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.filterBtn} ${filtro === t ? styles.active : ''}`}
                onClick={() => setFiltro(t)}
              >
                <Filter size={14} />
                {t === 'TODOS' ? 'Todos' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Carregando materiais..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Nenhum material encontrado"
            subtitle={filtro !== 'TODOS' ? `Sem materiais do tipo "${filtro}"` : 'Tente outro termo de busca'}
          />
        ) : (
          <div className={styles.galleryGrid}>
            {filtrados.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                isFavorite={Boolean(favoritos[m.id])}
                canFavorite={true}
                canManage={true}
                onFavorite={handleFavorite}
                onEdit={() => setEditingMaterial(m)}
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
