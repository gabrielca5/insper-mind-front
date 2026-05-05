import { useCallback, useEffect, useState } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { MaterialCard } from '../components/MaterialCard';
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

async function enrichFavorito(favorito) {
  const itemId = getFavoriteItemId(favorito);

  if (!isMaterialFavorite(favorito)) {
    return favorito;
  }

  if (!itemId) {
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

function FavoriteCard({ favorito, onRemove }) {
  const itemId = getFavoriteItemId(favorito);

  if (isMaterialFavorite(favorito)) {
    return (
      <MaterialCard
        material={favorito.item ?? { id: itemId, titulo: getFavoriteTitle(favorito), descricao: '' }}
        canFavorite
        isFavorite
        onFavorite={() => onRemove(favorito)}
      />
    );
  }

  return (
    <article className={styles.card}>
      <div>
        <h2 className={styles.cardTitle}>{getFavoriteTitle(favorito)}</h2>
        <p className={styles.meta}>
          {favorito.tipoItem ?? 'Item'} · {favorito.nomeUsuario ?? favorito.emailUsuario ?? 'Usuário'}
        </p>
        {favorito.item?.descricao && (
          <p className={styles.itemDescription}>{favorito.item.descricao}</p>
        )}
        {!itemId && (
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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadFavoritos = useCallback(async () => {
    setLoading(true);
    if (!auth?.email) {
      setFavoritos([]);
      setLoading(false);
      return;
    }

    const data = await favoritoService.listByUsuario(auth.email);
    const enriched = await Promise.all(data.map(enrichFavorito));
    setFavoritos(enriched);

    setLoading(false);
  }, [auth?.email]);

  useEffect(() => {
    loadFavoritos();
  }, [loadFavoritos]);

  const handleRemove = async (favorito) => {
    if (!window.confirm('Remover favorito?')) return;

    await favoritoService.deleteById(favorito.id);
    setMessage('Favorito removido.');
    await loadFavoritos();
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Breadcrumb items={[{ label: 'Catálogo', to: '/' }, { label: 'Favoritos' }]} />

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Favoritos</h1>
            <p className={styles.sub}>Materiais salvos na sua conta.</p>
          </div>
          <button className={styles.secondaryBtn} type="button" onClick={loadFavoritos}>
            Meus favoritos
          </button>
        </header>

        {!auth?.email && <p className={styles.message}>Faça login para ver seus itens salvos.</p>}
        {message && <p className={styles.message}>{message}</p>}

        {loading ? (
          <LoadingSpinner message="Carregando favoritos..." />
        ) : favoritos.length === 0 ? (
          <EmptyState icon="⭐" title="Nenhum favorito encontrado" subtitle="Abra um material e marque como favorito para salvá-lo aqui." />
        ) : (
          <div className={styles.list}>
            {favoritos.map((favorito) => (
              <FavoriteCard key={favorito.id} favorito={favorito} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
