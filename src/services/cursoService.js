// cursoService.js
// NOTA: O backend possui a entidade Curso mas o controller ainda está vazio (stub).
// Usando mock mínimo e coerente com o projeto enquanto o endpoint não existe.

import api from './api';

const MOCK_CURSOS = [
  {
    id: 1,
    nome: 'Ciência da Computação',
    descricao:
      'Formação sólida em algoritmos, estruturas de dados, sistemas operacionais, inteligência artificial e engenharia de software. Prepare-se para resolver problemas complexos com criatividade e rigor técnico.',
    codigo: 'CC',
    cargaHoraria: 3200,
    semestres: 8,
    turno: 'Integral',
  },
  {
    id: 2,
    nome: 'Engenharia da Computação',
    descricao:
      'Combinação entre hardware e software: eletrônica, sistemas embarcados, redes, programação e design de sistemas. Ideal para quem quer atuar na fronteira entre o mundo físico e digital.',
    codigo: 'EC',
    cargaHoraria: 3600,
    semestres: 10,
    turno: 'Integral',
  },
];

export const cursoService = {
  async list() {
    try {
      const response = await api.get('/curso');
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? MOCK_CURSOS;
    } catch {
      return MOCK_CURSOS;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/curso/${id}`);
      return response.data;
    } catch {
      return MOCK_CURSOS.find((c) => c.id === Number(id)) ?? null;
    }
  },
};
