import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'favorito';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'material:'];
const FAVORITO_ITEM_MAP_KEY = 'insperMindFavoriteItemMap';
const FAVORITO_REMOVED_KEY = 'insperMindRemovedFavorites';
const REMOVED_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function normalizeId(value) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getStoredFavoriteItemMap() {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(FAVORITO_ITEM_MAP_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveStoredFavoriteItemMap(map) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(FAVORITO_ITEM_MAP_KEY, JSON.stringify(map));
  } catch {
    // Sem localStorage, seguimos apenas com itemId retornado pela API.
  }
}

function rememberFavoriteItem(favoritoId, itemId) {
  const normalizedFavoritoId = normalizeId(favoritoId);
  const normalizedItemId = normalizeId(itemId);

  if (!normalizedFavoritoId || !normalizedItemId) return;

  const map = getStoredFavoriteItemMap();
  map[normalizedFavoritoId] = normalizedItemId;
  saveStoredFavoriteItemMap(map);
}

function forgetFavoriteItem(favoritoId) {
  const normalizedFavoritoId = normalizeId(favoritoId);
  if (!normalizedFavoritoId) return;

  const map = getStoredFavoriteItemMap();
  delete map[normalizedFavoritoId];
  saveStoredFavoriteItemMap(map);
}

function getRememberedItemId(favoritoId) {
  return normalizeId(getStoredFavoriteItemMap()[favoritoId]);
}

function getFavoriteItemId(favorito) {
  return normalizeId(
    favorito?.item?.id ??
      favorito?.material?.id ??
      favorito?.eletiva?.id ??
      favorito?.materialId ??
      favorito?.idMaterial ??
      favorito?.id_material ??
      favorito?.eletivaId ??
      favorito?.idEletiva ??
      favorito?.id_eletiva ??
      favorito?.recoveredItemId ??
      favorito?.itemId ??
      getRememberedItemId(favorito?.id)
  );
}

function getFavoriteType(favorito) {
  if (favorito?.tipoItem) return String(favorito.tipoItem).toUpperCase();
  if (favorito?.material || favorito?.materialId || favorito?.idMaterial || favorito?.id_material) return 'MATERIAL';
  if (favorito?.eletiva || favorito?.eletivaId || favorito?.idEletiva || favorito?.id_eletiva) return 'ELETIVA';
  return 'MATERIAL';
}

function getStoredRemovedFavorites() {
  if (typeof window === 'undefined') return {};

  try {
    const stored = JSON.parse(window.localStorage.getItem(FAVORITO_REMOVED_KEY) ?? '{}');
    const now = Date.now();
    const active = Object.fromEntries(
      Object.entries(stored).filter(([, timestamp]) => now - Number(timestamp) < REMOVED_TTL_MS)
    );

    if (Object.keys(active).length !== Object.keys(stored).length) {
      window.localStorage.setItem(FAVORITO_REMOVED_KEY, JSON.stringify(active));
    }

    return active;
  } catch {
    return {};
  }
}

function saveStoredRemovedFavorites(map) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(FAVORITO_REMOVED_KEY, JSON.stringify(map));
  } catch {
    // Sem localStorage, a remoção volta a depender apenas do backend.
  }
}

function getFavoriteRemovalKeys(favorito, fallback = {}) {
  const email = normalizeEmail(
    favorito?.emailUsuario ??
      favorito?.usuarioEmail ??
      favorito?.email ??
      fallback.emailUsuario ??
      fallback.usuarioEmail ??
      fallback.email
  );
  const tipoItem = getFavoriteType({ ...fallback, ...favorito });
  const itemId = getFavoriteItemId({ ...fallback, ...favorito });
  const favoritoId = normalizeId(favorito?.favoritoId ?? fallback.favoritoId ?? favorito?.id ?? fallback.id);
  const keys = [];

  if (email && tipoItem && itemId) keys.push(`item:${email}:${tipoItem}:${itemId}`);
  if (email && favoritoId) keys.push(`favorito:${email}:${favoritoId}`);
  if (!email && favoritoId) keys.push(`favorito:${favoritoId}`);

  return keys;
}

function markFavoriteLocallyRemoved(favorito) {
  const keys = getFavoriteRemovalKeys(favorito);
  if (keys.length === 0) return;

  const removed = getStoredRemovedFavorites();
  const now = Date.now();
  keys.forEach((key) => {
    removed[key] = now;
  });
  saveStoredRemovedFavorites(removed);
}

function unmarkFavoriteLocallyRemoved(favorito) {
  const keys = getFavoriteRemovalKeys(favorito);
  if (keys.length === 0) return;

  const removed = getStoredRemovedFavorites();
  keys.forEach((key) => {
    delete removed[key];
  });
  saveStoredRemovedFavorites(removed);
}

function isFavoriteLocallyRemoved(favorito, fallback = {}) {
  const removed = getStoredRemovedFavorites();
  return getFavoriteRemovalKeys(favorito, fallback).some((key) => Boolean(removed[key]));
}

function withRememberedItemId(favorito) {
  if (!favorito || typeof favorito !== 'object') return favorito;

  const itemId = getFavoriteItemId(favorito);

  return {
    ...favorito,
    ...(itemId ? { itemId } : {}),
    tipoItem: getFavoriteType(favorito),
  };
}

function normalizeFavoritos(data, fallback = {}) {
  return normalizeList(data)
    .map(withRememberedItemId)
    .filter((favorito) => !isFavoriteLocallyRemoved(favorito, fallback));
}

function normalizeFavoritePage(data, fallback = {}) {
  const pageData = normalizePage(data);
  const filterItems = (items = []) =>
    items.map(withRememberedItemId).filter((favorito) => !isFavoriteLocallyRemoved(favorito, fallback));

  return {
    ...pageData,
    content: filterItems(pageData.content),
    items: filterItems(pageData.items),
  };
}

function normalizeFavoritoPayload(dto) {
  const itemId = normalizeId(dto?.itemId ?? dto?.materialId ?? dto?.eletivaId);
  const tipoItem = String(dto?.tipoItem ?? (dto?.eletivaId ? 'ELETIVA' : 'MATERIAL')).toUpperCase();

  if (!itemId) {
    throw new Error('Não foi possível favoritar: o item não possui um ID válido.');
  }

  return {
    ...dto,
    itemId,
    tipoItem,
    ...(tipoItem === 'MATERIAL' ? { materialId: itemId } : {}),
    ...(tipoItem === 'ELETIVA' ? { eletivaId: itemId } : {}),
  };
}

function getErrorText(error) {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') return JSON.stringify(data);

  return String(error?.message ?? '');
}

function isDuplicateFavoriteError(error) {
  const text = getErrorText(error).toLowerCase();
  return text.includes('favoritado') || text.includes('favorita');
}

export const favoritoService = {
  async list(params = {}) {
    try {
      const requestParams = buildPageParams(params);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'list', requestParams), async () => {
        const response = await api.get('/favorito', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeFavoritos(data);
    } catch {
      return [];
    }
  },

  async listPage(page = 0, size = 20, sort) {
    try {
      const requestParams = buildPageParams(page, size, sort);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'page', requestParams), async () => {
        const response = await api.get('/favorito', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeFavoritePage(data);
    } catch {
      return normalizePage(null);
    }
  },

  async listByUsuario(emailUsuario, page = 0, size = 20) {
    try {
      const requestParams = buildPageParams({ page, size, emailUsuario, usuarioEmail: emailUsuario });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-usuario', requestParams), async () => {
        const response = await api.get('/favorito', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeFavoritos(data, { emailUsuario });
    } catch {
      return [];
    }
  },

  async save(dto) {
    const payload = normalizeFavoritoPayload(dto);
    const localContext = {
      emailUsuario: payload.emailUsuario,
      itemId: payload.itemId,
      tipoItem: payload.tipoItem,
    };

    try {
      const response = await api.post('/favorito', payload);
      rememberFavoriteItem(response.data?.id, payload.itemId);
      unmarkFavoriteLocallyRemoved({ ...localContext, id: response.data?.id });
      invalidateCache(MUTATION_SCOPES);
      return {
        ...response.data,
        itemId: response.data?.itemId ?? payload.itemId,
        tipoItem: response.data?.tipoItem ?? payload.tipoItem,
      };
    } catch (error) {
      if (!isDuplicateFavoriteError(error)) throw error;

      unmarkFavoriteLocallyRemoved(localContext);
      invalidateCache(MUTATION_SCOPES);
      return {
        id: payload.itemId,
        emailUsuario: payload.emailUsuario,
        itemId: payload.itemId,
        tipoItem: payload.tipoItem,
        localRecovered: true,
      };
    }
  },

  async deleteById(id, context = {}) {
    const localContext = { ...context, id, favoritoId: id };

    try {
      await api.delete(`/favorito/${encodePath(id)}`);
    } catch (error) {
      const status = error?.response?.status;
      if (![404, 405, 500].includes(status)) throw error;
    }

    markFavoriteLocallyRemoved(localContext);
    forgetFavoriteItem(id);
    invalidateCache(MUTATION_SCOPES);
  },

  getRememberedItemId(favoritoId) {
    return getRememberedItemId(favoritoId);
  },

  getItemId(favorito) {
    return getFavoriteItemId(favorito);
  },

  getTipoItem(favorito) {
    return getFavoriteType(favorito);
  },

  isLocallyRemoved(favorito, fallback) {
    return isFavoriteLocallyRemoved(favorito, fallback);
  },
};
