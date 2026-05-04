import api from './api';
import { buildPageParams, encodePath, normalizePage } from './serviceUtils';

export const docenteService = {
  async list(page = 0, size = 20, sort) {
    try {
      const response = await api.get('/docente', {
        params: buildPageParams(page, size, sort),
      });
      return normalizePage(response.data);
    } catch {
      return normalizePage(null);
    }
  },

  async getByEmail(email) {
    try {
      const response = await api.get(`/docente/${encodePath(email)}`);
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
    const response = await api.patch(`/docente/${encodePath(email)}`, dto);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/docente/${encodePath(id)}`);
  },
};
