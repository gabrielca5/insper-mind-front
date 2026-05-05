import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'comentario';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'material:'];

export const comentarioService = {
  async list(params = {}) {
    try {
      const requestParams = buildPageParams(params);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'list', requestParams), async () => {
        const response = await api.get('/comentario', {
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
        const response = await api.get('/comentario', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizePage(data);
    } catch {
      return normalizePage(null);
    }
  },

  async listByMaterial(materialId, page = 0, size = 20) {
    try {
      const requestParams = buildPageParams({ page, size, materialId });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-material', requestParams), async () => {
        const response = await api.get('/comentario', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeList(data);
    } catch {
      return [];
    }
  },

  async listByUsuario(emailUsuario, page = 0, size = 20) {
    try {
      const requestParams = buildPageParams({ page, size, emailUsuario, usuarioEmail: emailUsuario });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-usuario', requestParams), async () => {
        const response = await api.get('/comentario', {
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
    const response = await api.post('/comentario', dto);
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/comentario/${encodePath(id)}`, dto);
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async curtir(id) {
    const response = await api.patch(`/comentario/${encodePath(id)}/curtir`);
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/comentario/${encodePath(id)}`);
    invalidateCache(MUTATION_SCOPES);
  },
};
