// eletivaService.js
// NOTA: Controller ainda está vazio (stub). Preparado para futura integração.

import api from './api';

export const eletivaService = {
  async list() {
    try {
      const response = await api.get('/eletiva');
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? [];
    } catch {
      return [];
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/eletiva/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
