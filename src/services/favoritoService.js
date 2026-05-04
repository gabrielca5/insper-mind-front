import api from './api';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

export const favoritoService = {
  async list(params = {}) {
    try {
      const response = await api.get('/favorito', {
        params: buildPageParams(params),
      });
      return normalizeList(response.data);
    } catch {
      return [];
    }
  },

  async listPage(page = 0, size = 20, sort) {
    try {
      const response = await api.get('/favorito', {
        params: buildPageParams(page, size, sort),
      });
      return normalizePage(response.data);
    } catch {
      return normalizePage(null);
    }
  },

  async listByUsuario(emailUsuario, page = 0, size = 20) {
    try {
      const response = await api.get('/favorito', {
        params: buildPageParams({ page, size, emailUsuario, usuarioEmail: emailUsuario }),
      });
      return normalizeList(response.data);
    } catch {
      return [];
    }
  },

  async save(dto) {
    const response = await api.post('/favorito', dto);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/favorito/${encodePath(id)}`);
  },
};
