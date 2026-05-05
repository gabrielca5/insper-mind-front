import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'usuario';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;

export const usuarioService = {
  async list(page = 0, size = 20, sort) {
    try {
      const requestParams = buildPageParams(page, size, sort);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'page', requestParams), async () => {
        const response = await api.get('/usuario', {
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
        const response = await api.get(`/usuario/${encodePath(email)}`);
        return response.data;
      });
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/usuario', dto);
    invalidateCache(CACHE_SCOPE);
    return response.data;
  },

  async login(dto) {
    const response = await api.post('/usuario/login', dto);
    return response.data;
  },

  async update(email, dto) {
    const response = await api.patch(`/usuario/${encodePath(email)}`, dto);
    invalidateCache(CACHE_SCOPE);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/usuario/${encodePath(id)}`);
    invalidateCache(CACHE_SCOPE);
  },
};
