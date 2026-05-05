import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'curso';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;

const MOCK_CURSOS = [
  {
    id: 1,
    nome: 'Ciência da Computação',
    descricao:
      'Formação sólida em algoritmos, estruturas de dados, sistemas operacionais, inteligência artificial e engenharia de software.',
    codigo: 'CC',
    cargaHoraria: 3200,
    semestres: 8,
    turno: 'Integral',
  },
  {
    id: 2,
    nome: 'Engenharia da Computação',
    descricao:
      'Combinação entre hardware e software: eletrônica, sistemas embarcados, redes, programação e design de sistemas.',
    codigo: 'EC',
    cargaHoraria: 3600,
    semestres: 10,
    turno: 'Integral',
  },
];

export const cursoService = {
  async list(params = {}) {
    try {
      const requestParams = buildPageParams(params);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'list', requestParams), async () => {
        const response = await api.get('/curso', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeList(data, MOCK_CURSOS);
    } catch {
      return MOCK_CURSOS;
    }
  },

  async listPage(page = 0, size = 20, sort) {
    try {
      const requestParams = buildPageParams(page, size, sort);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'page', requestParams), async () => {
        const response = await api.get('/curso', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizePage(data, MOCK_CURSOS);
    } catch {
      return normalizePage(null, MOCK_CURSOS);
    }
  },

  async getById(id) {
    try {
      return await cachedGet(createCacheKey(CACHE_RESOURCE, 'item', { id }), async () => {
        const response = await api.get(`/curso/${encodePath(id)}`);
        return response.data;
      });
    } catch {
      return MOCK_CURSOS.find((curso) => curso.id === Number(id)) ?? null;
    }
  },

  async save(dto) {
    const response = await api.post('/curso', dto);
    invalidateCache(CACHE_SCOPE);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/curso/${encodePath(id)}`, dto);
    invalidateCache(CACHE_SCOPE);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/curso/${encodePath(id)}`);
    invalidateCache(CACHE_SCOPE);
  },
};
