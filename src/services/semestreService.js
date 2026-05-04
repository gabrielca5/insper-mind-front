// semestreService.js
// NOTA: Controller existe mas está vazio (stub). Preparado para futura integração.

import api from './api';

export const semestreService = {
  async list() {
    try {
      const response = await api.get('/semestre');
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? [];
    } catch {
      return [];
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/semestre/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
