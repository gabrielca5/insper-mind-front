// comentarioService.js
// NOTA: Controller ainda está vazio (stub). Services preparados para futura integração.

import api from './api';

export const comentarioService = {
  async listByMaterial(materialId) {
    try {
      const response = await api.get(`/comentario?materialId=${materialId}`);
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? [];
    } catch {
      return [];
    }
  },

  async save(dto) {
    const response = await api.post('/comentario', dto);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/comentario/${id}`);
  },
};
