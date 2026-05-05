import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'disciplina-db';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'material:'];
const LIST_BY_CURSO_SIZE = 250;

export const disciplinaService = {
  async list(params = {}) {
    try {
      const requestParams = buildPageParams(params);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'list', requestParams), async () => {
        const response = await api.get('/disciplina', {
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
        const response = await api.get('/disciplina', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizePage(data);
    } catch {
      return normalizePage(null);
    }
  },

  async listByCurso(cursoId) {
    try {
      const requestParams = buildPageParams({
        page: 0,
        size: LIST_BY_CURSO_SIZE,
        sort: 'nome,asc',
      });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-curso', requestParams), async () => {
        const response = await api.get('/disciplina', {
          params: requestParams,
        });
        return response.data;
      });

      return normalizeList(data).filter((disciplina) => disciplina.cursoId === Number(cursoId));
    } catch {
      return [];
    }
  },

  async getById(id) {
    try {
      return await cachedGet(createCacheKey(CACHE_RESOURCE, 'item', { id }), async () => {
        const response = await api.get(`/disciplina/${encodePath(id)}`);
        return response.data;
      });
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/disciplina', dto);
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/disciplina/${encodePath(id)}`, dto);
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/disciplina/${encodePath(id)}`);
    invalidateCache(MUTATION_SCOPES);
  },
};
