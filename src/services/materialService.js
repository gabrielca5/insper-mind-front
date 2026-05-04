// materialService.js
// NOTA: O backend possui a entidade Material e enum TipoMaterial, mas o controller ainda está vazio.
// Mock mínimo para protótipo visual.

import api from './api';

const MOCK_MATERIAIS = [
  { id: 1, disciplinaId: 1, titulo: 'Slides: Introdução a Algoritmos', tipo: 'SLIDE', link: '#', descricao: 'Apresentação introdutória sobre notação assintótica e análise de algoritmos.' },
  { id: 2, disciplinaId: 1, titulo: 'Lista de Exercícios 01', tipo: 'EXERCICIO', link: '#', descricao: 'Exercícios de fixação sobre complexidade e recursão.' },
  { id: 3, disciplinaId: 1, titulo: 'Livro: Introduction to Algorithms (CLRS)', tipo: 'PDF', link: '#', descricao: 'Capítulos 1-4 do livro clássico de Cormen et al.' },
  { id: 4, disciplinaId: 2, titulo: 'Slides: Processos e Threads', tipo: 'SLIDE', link: '#', descricao: 'Material sobre gerência de processos em SOs modernos.' },
  { id: 5, disciplinaId: 3, titulo: 'Vídeo: Redes Neurais do Zero', tipo: 'VIDEO', link: '#', descricao: 'Aula gravada sobre implementação de redes neurais simples.' },
  { id: 6, disciplinaId: 3, titulo: 'Artigo: Deep Learning Overview', tipo: 'ARTIGO', link: '#', descricao: 'LeCun, Bengio e Hinton — artigo seminal de deep learning.' },
  { id: 7, disciplinaId: 4, titulo: 'Guia de Metodologias Ágeis', tipo: 'LINK', link: '#', descricao: 'Referência online sobre Scrum, Kanban e XP.' },
  { id: 8, disciplinaId: 5, titulo: 'Apostila de SQL', tipo: 'PDF', link: '#', descricao: 'Apostila completa com DDL, DML e consultas avançadas.' },
  { id: 9, disciplinaId: 6, titulo: 'Slides: Lógica Digital', tipo: 'SLIDE', link: '#', descricao: 'Portas lógicas, flip-flops e mapas de Karnaugh.' },
  { id: 10, disciplinaId: 7, titulo: 'Datasheet: STM32', tipo: 'PDF', link: '#', descricao: 'Documentação técnica do microcontrolador STM32F4.' },
];

const TIPOS_ICON = {
  PDF: '📄',
  VIDEO: '🎥',
  SLIDE: '🖼️',
  ARTIGO: '📰',
  LINK: '🔗',
  EXERCICIO: '📝',
  OUTRO: '📦',
};

export const materialService = {
  async list(params = {}) {
    try {
      const response = await api.get('/material', { params });
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? MOCK_MATERIAIS;
    } catch {
      return MOCK_MATERIAIS;
    }
  },

  async listByDisciplina(disciplinaId) {
    try {
      const response = await api.get(`/material?disciplinaId=${disciplinaId}`);
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? MOCK_MATERIAIS.filter((m) => m.disciplinaId === Number(disciplinaId));
    } catch {
      return MOCK_MATERIAIS.filter((m) => m.disciplinaId === Number(disciplinaId));
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/material/${id}`);
      return response.data;
    } catch {
      return MOCK_MATERIAIS.find((m) => m.id === Number(id)) ?? null;
    }
  },

  getTipoIcon(tipo) {
    return TIPOS_ICON[tipo] ?? TIPOS_ICON.OUTRO;
  },
};
