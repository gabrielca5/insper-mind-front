import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'disciplina';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'material:'];

const MOCK_DISCIPLINAS = [
  { id: 1, cursoId: 1, nome: 'Algoritmos e Estruturas de Dados', descricao: 'Fundamentos de algoritmos, complexidade e estruturas de dados.', semestre: 2, docenteEmail: null },
  { id: 2, cursoId: 1, nome: 'Sistemas Operacionais', descricao: 'Processos, memória, sistemas de arquivos e segurança em SOs modernos.', semestre: 4, docenteEmail: null },
  { id: 3, cursoId: 1, nome: 'Inteligência Artificial', descricao: 'Busca, representação do conhecimento, aprendizado de máquina e redes neurais.', semestre: 6, docenteEmail: null },
  { id: 4, cursoId: 1, nome: 'Engenharia de Software', descricao: 'Metodologias ágeis, arquitetura de software, testes e qualidade.', semestre: 5, docenteEmail: null },
  { id: 5, cursoId: 1, nome: 'Banco de Dados', descricao: 'Modelagem relacional, SQL, NoSQL e otimização de consultas.', semestre: 3, docenteEmail: null },
  { id: 6, cursoId: 2, nome: 'Eletrônica Digital', descricao: 'Circuitos combinacionais, sequenciais, FPGAs e lógica programável.', semestre: 2, docenteEmail: null },
  { id: 7, cursoId: 2, nome: 'Sistemas Embarcados', descricao: 'Microcontroladores, RTOS, interfaces de hardware e programação de baixo nível.', semestre: 5, docenteEmail: null },
  { id: 8, cursoId: 2, nome: 'Redes de Computadores', descricao: 'Modelos OSI/TCP-IP, protocolos, segurança e infraestrutura de redes.', semestre: 4, docenteEmail: null },
  { id: 9, cursoId: 2, nome: 'Sinais e Sistemas', descricao: 'Transformadas, análise no domínio da frequência e processamento de sinais.', semestre: 3, docenteEmail: null },
  { id: 10, cursoId: 2, nome: 'Arquitetura de Computadores', descricao: 'Pipeline, hierarquia de memória, paralelismo e organizações modernas de CPUs.', semestre: 3, docenteEmail: null },
];

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
      return normalizeList(data, MOCK_DISCIPLINAS);
    } catch {
      return MOCK_DISCIPLINAS;
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
      return normalizePage(data, MOCK_DISCIPLINAS);
    } catch {
      return normalizePage(null, MOCK_DISCIPLINAS);
    }
  },

  async listByCurso(cursoId) {
    try {
      const requestParams = buildPageParams({ cursoId });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-curso', requestParams), async () => {
        const response = await api.get('/disciplina', {
          params: requestParams,
        });
        return response.data;
      });
      const items = normalizeList(data);
      return items.length > 0
        ? items
        : MOCK_DISCIPLINAS.filter((disciplina) => disciplina.cursoId === Number(cursoId));
    } catch {
      return MOCK_DISCIPLINAS.filter((disciplina) => disciplina.cursoId === Number(cursoId));
    }
  },

  async getById(id) {
    try {
      return await cachedGet(createCacheKey(CACHE_RESOURCE, 'item', { id }), async () => {
        const response = await api.get(`/disciplina/${encodePath(id)}`);
        return response.data;
      });
    } catch {
      return MOCK_DISCIPLINAS.find((disciplina) => disciplina.id === Number(id)) ?? null;
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
