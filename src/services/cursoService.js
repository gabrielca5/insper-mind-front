import api from './api';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

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
      const response = await api.get('/curso', {
        params: buildPageParams(params),
      });
      return normalizeList(response.data, MOCK_CURSOS);
    } catch {
      return MOCK_CURSOS;
    }
  },

  async listPage(page = 0, size = 20, sort) {
    try {
      const response = await api.get('/curso', {
        params: buildPageParams(page, size, sort),
      });
      return normalizePage(response.data, MOCK_CURSOS);
    } catch {
      return normalizePage(null, MOCK_CURSOS);
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/curso/${encodePath(id)}`);
      return response.data;
    } catch {
      return MOCK_CURSOS.find((curso) => curso.id === Number(id)) ?? null;
    }
  },

  async save(dto) {
    const response = await api.post('/curso', dto);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/curso/${encodePath(id)}`, dto);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/curso/${encodePath(id)}`);
  },
};
