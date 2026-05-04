// favoritoService.js
// NOTA: Controller ainda está vazio (stub). Services preparados para futura integração.

import api from './api';

export const favoritoService = {
  async listByUsuario(usuarioEmail) {
    try {
      const response = await api.get(`/favorito?usuarioEmail=${usuarioEmail}`);
      const data = response.data;
      return Array.isArray(data) ? data : data.content ?? [];
    } catch {
      return [];
    }
  },

  async save(dto) {
    const response = await api.post('/favorito', dto);
    return response.data;
  },

  async deleteById(id) {
    await api.delete(`/favorito/${id}`);
  },
};
