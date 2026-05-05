import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmptyState, LoadingSpinner } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import { favoritoService } from '../services/favoritoService';
import { materialService } from '../services/materialService';
import styles from './Favoritos.module.css';

function isMaterialFavorite(favorito) {
  return favorito.tipoItem === 'MATERIAL' || !favorito.tipoItem;
}

function getFavoriteItemId(favorito) {
  return favorito.item?.id ?? favorito.recoveredItemId ?? favorito.itemId ?? null;
}

function getDateDistance(dateA, dateB) {
  const timeA = Date.parse(dateA ?? '');
  const timeB = Date.parse(dateB ?? '');

  if (Number.isNaN(timeA) || Number.isNaN(timeB)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.abs(timeA - timeB);
}

async function recoverMaterialForBrokenFavorite(favorito) {
  const materiais = await materialService.list({ page: 0, size: 100 });
  const byUser = materiais.filter((material) => material.emailUsuario === favorito.emailUsuario);
  const candidates = byUser.length > 0 ? byUser : materiais;

  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort((a, b) => {
    const dateDistance = getDateDistance(a.dataCriacao, favorito.dataSalvo)
      - getDateDistance(b.dataCriacao, favorito.dataSalvo);

    if (dateDistance !== 0) {
      return dateDistance;
    }

    return Number(b.id ?? 0) - Number(a.id ?? 0);
  })[0];
}

async function enrichFavorito(favorito) {
  const itemId = getFavoriteItemId(favorito);

  if (!isMaterialFavorite(favorito)) {
    return favorito;
  }

  if (!itemId) {
    try {
      const item = await recoverMaterialForBrokenFavorite(favorito);

      if (item?.id) {
        return {
          ...favorito,
          item,
          recoveredItemId: item.id,
          recoveredFromBrokenFavorite: true,
        };
      }
    } catch {
      return favorito;
    }

    return favorito;
  }

  try {
    const item = await materialService.getById(itemId);
    return { ...favorito, item };
  } catch {
    return favorito;
  }
}

function getFavoriteTitle(favorito) {
  if (favorito.item?.titulo) {
    return favorito.item.titulo;
  }

  if (isMaterialFavorite(favorito)) {
    const itemId = getFavoriteItemId(favorito);
    return itemId ? `Material #${itemId}` : 'Material sem ID';
  }

  return `${favorito.tipoItem ?? 'Favorito'} #${favorito.itemId ?? '-'}`;
}

function getFavoriteSubtitle(favorito) {
  return [
    favorito.item?.tipo ?? favorito.tipoItem ?? 'Item',
    getFavoriteItemId(favorito) ? `item id ${getFavoriteItemId(favorito)}` : 'sem itemId',
    favorito.nomeUsuario ?? favorito.emailUsuario ?? 'Usuário',
    `favorito id ${favorito.id}`,
  ].filter(Boolean).join(' · ');
}

function FavoriteCard({ favorito, onRemove }) {
  const itemId = getFavoriteItemId(favorito);

  return (
    <article className={styles.card}>
      <div>
        <h2 className={styles.cardTitle}>{getFavoriteTitle(favorito)}</h2>
        <p className={styles.meta}>{getFavoriteSubtitle(favorito)}</p>
        {favorito.item?.descricao && (
          <p className={styles.itemDescription}>{favorito.item.descricao}</p>
        )}
        {isMaterialFavorite(favorito) && !itemId && (
          <p className={styles.itemWarning}>
            Este favorito foi salvo pela API sem itemId. Remova e favorite o material novamente.
          </p>
        )}
      </div>
      <div className={styles.actions}>
        {isMaterialFavorite(favorito) && itemId && (
          <Link className={styles.secondaryBtn} to={`/materiais/${itemId}`}>
            Ver material
          </Link>
        )}
        <button className={styles.dangerBtn} type="button" onClick={() => onRemove(favorito)}>
          Remover favorito
        </button>
      </div>
    </article>
  );
}

export function Favoritos() {
  const auth = useAuth();
  const [favoritos, setFavoritos] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadFavoritos = useCallback(async (nextPage = page) => {
    setLoading(true);
    const data = auth?.email
      ? await favoritoService.listByUsuario(auth.email, nextPage, 20)
      : await favoritoService.listPage(nextPage, 20);

    if (Array.isArray(data)) {
      const enriched = await Promise.all(data.map(enrichFavorito));
      setFavoritos(enriched);
      setTotalPages(data.length > 0 ? 1 : 0);
    } else {
      const items = data.items ?? [];
      const enriched = await Promise.all(items.map(enrichFavorito));
      setFavoritos(enriched);
      setTotalPages(data.totalPages ?? 0);
    }

    setLoading(false);
  }, [auth?.email, page]);

  useEffect(() => {
    loadFavoritos(page);
  }, [loadFavoritos, page]);

  const handleRemove = async (favorito) => {
    if (!window.confirm('Remover favorito?')) return;

    await favoritoService.deleteById(favorito.id);
    setMessage('Favorito removido.');
    await loadFavoritos(page);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Catálogo', to: '/' }, { label: 'Favoritos' }]} />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Favoritos</h1>
            <p className={styles.sub}>Itens salvos pela rota <code>GET /favorito</code>.</p>
          </div>
          <button className={styles.secondaryBtn} type="button" onClick={() => loadFavoritos(page)}>
            Meus favoritos
          </button>
        </header>

        {!auth?.email && (
          <p className={styles.message}>Faça login para filtrar favoritos pelo seu email.</p>
        )}
        {message && <p className={styles.message}>{message}</p>}

        {loading ? (
          <LoadingSpinner message="Carregando favoritos..." />
        ) : favoritos.length === 0 ? (
          <EmptyState icon="⭐" title="Nenhum favorito encontrado" />
        ) : (
          <div className={styles.list}>
            {favoritos.map((favorito) => (
              <FavoriteCard key={favorito.id} favorito={favorito} onRemove={handleRemove} />
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
      </div>
    </div>
  );
}
