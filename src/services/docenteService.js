import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'docente';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;

export const docenteService = {
  async list(page = 0, size = 20, sort) {
    try {
      const requestParams = buildPageParams(page, size, sort);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'page', requestParams), async () => {
        const response = await api.get('/docente', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizePage(data);
    } catch {
      return normalizePage(null);
    }
  },

  async getByEmail(email) {
    try {
      return await cachedGet(createCacheKey(CACHE_RESOURCE, 'item', { email }), async () => {
        const response = await api.get(`/docente/${encodePath(email)}`);
        return response.data;
      });
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/docente', dto);
    invalidateCache(CACHE_SCOPE);
    return response.data;
  },

  async update(email, dto) {
    const response = await api.patch(`/docente/${encodePath(email)}`, dto);
    invalidateCache(CACHE_SCOPE);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/docente/${encodePath(id)}`);
    invalidateCache(CACHE_SCOPE);
  },
};
