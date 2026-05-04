// docenteService.js
// Endpoint real: GET /docente (paginado), GET /docente/{email}, POST /docente, PATCH /docente/{email}

import api from './api';

export const docenteService = {
  async list(page = 0, size = 20) {
    try {
      const response = await api.get('/docente', { params: { page, size } });
      const data = response.data;
      // Spring Page
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
      const response = await api.get(`/docente/${email}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/docente', dto);
    return response.data;
  },

  async update(email, dto) {
    const response = await api.patch(`/docente/${email}`, dto);
    return response.data;
  },
};
