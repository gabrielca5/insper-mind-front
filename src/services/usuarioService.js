import api from './api';
import { buildPageParams, encodePath, normalizePage } from './serviceUtils';

export const usuarioService = {
  async list(page = 0, size = 20, sort) {
    try {
      const response = await api.get('/usuario', {
        params: buildPageParams(page, size, sort),
      });
      return normalizePage(response.data);
    } catch {
      return normalizePage(null);
    }
  },

  async getByEmail(email) {
    try {
      const response = await api.get(`/usuario/${encodePath(email)}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async save(dto) {
    const response = await api.post('/usuario', dto);
    return response.data;
  },

  async login(dto) {
    const response = await api.post('/usuario/login', dto);
    return response.data;
  },

  async update(email, dto) {
    const response = await api.patch(`/usuario/${encodePath(email)}`, dto);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/usuario/${encodePath(id)}`);
  },
};
