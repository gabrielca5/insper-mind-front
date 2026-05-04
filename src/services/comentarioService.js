import api from './api';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

export const comentarioService = {
  async list(params = {}) {
    try {
      const response = await api.get('/comentario', {
        params: buildPageParams(params),
      });
      return normalizeList(response.data);
    } catch {
      return [];
    }
  },

  async listPage(page = 0, size = 20, sort) {
    try {
      const response = await api.get('/comentario', {
        params: buildPageParams(page, size, sort),
      });
      return normalizePage(response.data);
    } catch {
      return normalizePage(null);
    }
  },

  async listByMaterial(materialId, page = 0, size = 20) {
    try {
      const response = await api.get('/comentario', {
        params: buildPageParams({ page, size, materialId }),
      });
      return normalizeList(response.data);
    } catch {
      return [];
    }
  },

  async listByUsuario(emailUsuario, page = 0, size = 20) {
    try {
      const response = await api.get('/comentario', {
        params: buildPageParams({ page, size, emailUsuario, usuarioEmail: emailUsuario }),
      });
      return normalizeList(response.data);
    } catch {
      return [];
    }
  },

  async save(dto) {
    const response = await api.post('/comentario', dto);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/comentario/${encodePath(id)}`, dto);
    return response.data;
  },

  async curtir(id) {
    const response = await api.patch(`/comentario/${encodePath(id)}/curtir`);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/comentario/${encodePath(id)}`);
  },
};
