import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'eletiva';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;

export const eletivaService = {
  async list(params = {}) {
    try {
      const requestParams = buildPageParams(params);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'list', requestParams), async () => {
        const response = await api.get('/eletivas', {
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
        const response = await api.get('/eletivas', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizePage(data);
    } catch {
      return normalizePage(null);
    }
  },

  async getById(id) {
    try {
      return await cachedGet(createCacheKey(CACHE_RESOURCE, 'item', { id }), async () => {
        const response = await api.get(`/eletivas/${encodePath(id)}`);
        return response.data;
      });
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/eletivas', dto);
    invalidateCache(CACHE_SCOPE);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/eletivas/${encodePath(id)}`, dto);
    invalidateCache(CACHE_SCOPE);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/eletivas/${encodePath(id)}`);
    invalidateCache(CACHE_SCOPE);
  },
};
