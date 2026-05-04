// usuarioService.js
// Endpoint real: GET /usuario (paginado), GET /usuario/{email}, POST /usuario, PATCH /usuario/{email}

import api from './api';

export const usuarioService = {
  async list(page = 0, size = 20) {
    try {
      const response = await api.get('/usuario', { params: { page, size } });
      const data = response.data;
      if (data.content !== undefined) {
        return { items: data.content, totalPages: data.totalPages, totalElements: data.totalElements };
      }
      return { items: Array.isArray(data) ? data : [], totalPages: 1, totalElements: 0 };
    } catch {
      return { items: [], totalPages: 0, totalElements: 0 };
    }
  },

  async getByEmail(email) {
    try {
      const response = await api.get(`/usuario/${email}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/usuario', dto);
    return response.data;
  },

  async update(email, dto) {
    const response = await api.patch(`/usuario/${email}`, dto);
    return response.data;
  },
};
