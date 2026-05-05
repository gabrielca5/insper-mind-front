import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'material';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'favorito:'];

const MOCK_MATERIAIS = [
  { id: 1, disciplinaId: 1, titulo: 'Slides: Introdução a Algoritmos', tipo: 'SLIDE', link: '#', descricao: 'Apresentação introdutória sobre notação assintótica e análise de algoritmos.' },
  { id: 2, disciplinaId: 1, titulo: 'Lista de Exercícios 01', tipo: 'EXERCICIO', link: '#', descricao: 'Exercícios de fixação sobre complexidade e recursão.' },
  { id: 3, disciplinaId: 1, titulo: 'Livro: Introduction to Algorithms (CLRS)', tipo: 'PDF', link: '#', descricao: 'Capítulos 1-4 do livro clássico de Cormen et al.' },
  { id: 4, disciplinaId: 2, titulo: 'Slides: Processos e Threads', tipo: 'SLIDE', link: '#', descricao: 'Material sobre gerência de processos em SOs modernos.' },
  { id: 5, disciplinaId: 3, titulo: 'Vídeo: Redes Neurais do Zero', tipo: 'VIDEO', link: '#', descricao: 'Aula gravada sobre implementação de redes neurais simples.' },
  { id: 6, disciplinaId: 3, titulo: 'Artigo: Deep Learning Overview', tipo: 'ARTIGO', link: '#', descricao: 'LeCun, Bengio e Hinton - artigo seminal de deep learning.' },
  { id: 7, disciplinaId: 4, titulo: 'Guia de Metodologias Ágeis', tipo: 'LINK', link: '#', descricao: 'Referência online sobre Scrum, Kanban e XP.' },
  { id: 8, disciplinaId: 5, titulo: 'Apostila de SQL', tipo: 'PDF', link: '#', descricao: 'Apostila completa com DDL, DML e consultas avançadas.' },
  { id: 9, disciplinaId: 6, titulo: 'Slides: Lógica Digital', tipo: 'SLIDE', link: '#', descricao: 'Portas lógicas, flip-flops e mapas de Karnaugh.' },
  { id: 10, disciplinaId: 7, titulo: 'Datasheet: STM32', tipo: 'PDF', link: '#', descricao: 'Documentação técnica do microcontrolador STM32F4.' },
];

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

function normalizeMaterialPayload(dto) {
  const tipo = String(dto?.tipo ?? '').trim().toUpperCase();

  if (!SUPPORTED_MATERIAL_TYPES.includes(tipo)) {
    throw new Error('A API de material está aceitando apenas o tipo PDF no momento.');
  }

  return {
    ...dto,
    tipo,
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
      return normalizeList(data, MOCK_MATERIAIS);
    } catch {
      return MOCK_MATERIAIS;
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
      return normalizePage(data, MOCK_MATERIAIS);
    } catch {
      return normalizePage(null, MOCK_MATERIAIS);
    }
  },

  async listByDisciplina(disciplinaId) {
    try {
      const requestParams = buildPageParams({ disciplinaId });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-disciplina', requestParams), async () => {
        const response = await api.get('/material', {
          params: requestParams,
        });
        return response.data;
      });
      const items = normalizeList(data);
      return items.length > 0
        ? items
        : MOCK_MATERIAIS.filter((material) => material.disciplinaId === Number(disciplinaId));
    } catch {
      return MOCK_MATERIAIS.filter((material) => material.disciplinaId === Number(disciplinaId));
    }
  },

  async getById(id) {
    try {
      return await cachedGet(createCacheKey(CACHE_RESOURCE, 'item', { id }), async () => {
        const response = await api.get(`/material/${encodePath(id)}`);
        return response.data;
      });
    } catch {
      return MOCK_MATERIAIS.find((material) => material.id === Number(id)) ?? null;
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
