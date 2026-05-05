import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'favorito';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'material:'];

function normalizeFavoritoPayload(dto) {
  const itemId = Number(dto?.itemId);

  if (!Number.isFinite(itemId) || itemId <= 0) {
    throw new Error('Não foi possível favoritar: o item não possui um ID válido.');
  }

  return {
    ...dto,
    itemId,
    tipoItem: dto?.tipoItem ?? 'MATERIAL',
  };
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
      return normalizeList(data);
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
      return normalizePage(data);
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
      return normalizeList(data);
    } catch {
      return [];
    }
  },

  async save(dto) {
    const response = await api.post('/favorito', normalizeFavoritoPayload(dto));
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/favorito/${encodePath(id)}`);
    invalidateCache(MUTATION_SCOPES);
  },
};
