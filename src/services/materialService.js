import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'material-db';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'favorito:'];
const LIST_BY_DISCIPLINA_SIZE = 250;

export const SUPPORTED_MATERIAL_TYPES = ['PDF'];

const TIPOS_ICON = {
  PDF: '\uD83D\uDCC4',
  VIDEO: '\uD83C\uDFA5',
  SLIDE: '\uD83D\uDDBC\uFE0F',
  ARTIGO: '\uD83D\uDCF0',
  LINK: '\uD83D\uDD17',
  EXERCICIO: '\uD83D\uDCDD',
  OUTRO: '\uD83D\uDCE6',
};

function normalizeId(value) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function normalizeMaterialPayload(dto) {
  const tipo = String(dto?.tipo ?? '').trim().toUpperCase();
  const disciplinaId = normalizeId(dto?.disciplinaId);

  if (!SUPPORTED_MATERIAL_TYPES.includes(tipo)) {
    throw new Error('A API de material esta aceitando apenas o tipo PDF no momento.');
  }

  if (!disciplinaId) {
    throw new Error('Selecione uma disciplina valida para vincular o material.');
  }

  const { cursoId, nomeCurso, nomeDisciplina, ...payload } = dto ?? {};

  return {
    ...payload,
    tipo,
    disciplinaId,
  };
}

export const materialService = {
  async list(params = {}) {
    try {
      const requestParams = buildPageParams(params);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'list', requestParams), async () => {
        const response = await api.get('/material', {
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
        const response = await api.get('/material', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizePage(data);
    } catch {
      return normalizePage(null);
    }
  },

  async listByDisciplina(disciplinaId) {
    try {
      const requestParams = buildPageParams({
        page: 0,
        size: LIST_BY_DISCIPLINA_SIZE,
        sort: 'titulo,asc',
      });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-disciplina', requestParams), async () => {
        const response = await api.get('/material', {
          params: requestParams,
        });
        return response.data;
      });

      return normalizeList(data).filter((material) => material.disciplinaId === Number(disciplinaId));
    } catch {
      return [];
    }
  },

  async getById(id) {
    try {
      return await cachedGet(createCacheKey(CACHE_RESOURCE, 'item', { id }), async () => {
        const response = await api.get(`/material/${encodePath(id)}`);
        return response.data;
      });
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/material', normalizeMaterialPayload(dto));
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/material/${encodePath(id)}`, normalizeMaterialPayload(dto));
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/material/${encodePath(id)}`);
    invalidateCache(MUTATION_SCOPES);
  },

  getTipoIcon(tipo) {
    return TIPOS_ICON[tipo] ?? TIPOS_ICON.OUTRO;
  },
};
