import api from './api';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

export const semestreService = {
  async list(params = {}) {
    try {
      const response = await api.get('/semestre', {
        params: buildPageParams(params),
      });
      return normalizeList(response.data);
    } catch {
      return [];
    }
  },

  async listPage(page = 0, size = 20, sort) {
    try {
      const response = await api.get('/semestre', {
        params: buildPageParams(page, size, sort),
      });
      return normalizePage(response.data);
    } catch {
      return normalizePage(null);
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/semestre/${encodePath(id)}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/semestre', dto);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/semestre/${encodePath(id)}`, dto);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/semestre/${encodePath(id)}`);
  },
};
