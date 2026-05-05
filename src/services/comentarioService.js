import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'comentario';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'material:'];
const COMMENT_LIKES_KEY = 'insperMindCommentLikes';

function normalizeId(value) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function getLikeOwner(emailUsuario) {
  return String(emailUsuario || 'anonimo').trim().toLowerCase();
}

function getStoredCommentLikes() {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(COMMENT_LIKES_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveStoredCommentLikes(likes) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(COMMENT_LIKES_KEY, JSON.stringify(likes));
  } catch {
    // Sem localStorage, a API ainda recebe a curtida normalmente.
  }
}

function hasStoredCommentLike(commentId, emailUsuario) {
  const normalizedCommentId = normalizeId(commentId);
  if (!normalizedCommentId) return false;

  const likes = getStoredCommentLikes();
  const owner = getLikeOwner(emailUsuario);
  return (likes[owner] ?? []).some((id) => Number(id) === normalizedCommentId);
}

function rememberCommentLike(commentId, emailUsuario) {
  const normalizedCommentId = normalizeId(commentId);
  if (!normalizedCommentId) return;

  const likes = getStoredCommentLikes();
  const owner = getLikeOwner(emailUsuario);
  const ownerLikes = new Set((likes[owner] ?? []).map(Number));
  ownerLikes.add(normalizedCommentId);
  likes[owner] = Array.from(ownerLikes);
  saveStoredCommentLikes(likes);
}

export const comentarioService = {
  async list(params = {}) {
    try {
      const requestParams = buildPageParams(params);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'list', requestParams), async () => {
        const response = await api.get('/comentario', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeList(data);
    } catch {
      return [];
    }
  },

  async listPage(page = 0, size = 20, sort) {
    try {
      const requestParams = buildPageParams(page, size, sort);
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'page', requestParams), async () => {
        const response = await api.get('/comentario', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizePage(data);
    } catch {
      return normalizePage(null);
    }
  },

  async listByMaterial(materialId, page = 0, size = 20) {
    try {
      const requestParams = buildPageParams({ page, size, materialId });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-material', requestParams), async () => {
        const response = await api.get('/comentario', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeList(data);
    } catch {
      return [];
    }
  },

  async listByUsuario(emailUsuario, page = 0, size = 20) {
    try {
      const requestParams = buildPageParams({ page, size, emailUsuario, usuarioEmail: emailUsuario });
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-usuario', requestParams), async () => {
        const response = await api.get('/comentario', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeList(data);
    } catch {
      return [];
    }
  },

  async save(dto) {
    const response = await api.post('/comentario', dto);
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async update(id, dto) {
    const response = await api.put(`/comentario/${encodePath(id)}`, dto);
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  async curtir(id) {
    const response = await api.patch(`/comentario/${encodePath(id)}/curtir`);
    invalidateCache(MUTATION_SCOPES);
    return response.data;
  },

  hasLiked(id, emailUsuario) {
    return hasStoredCommentLike(id, emailUsuario);
  },

  rememberLike(id, emailUsuario) {
    rememberCommentLike(id, emailUsuario);
  },

  getLikedIds(emailUsuario) {
    const likes = getStoredCommentLikes();
    return new Set((likes[getLikeOwner(emailUsuario)] ?? []).map(Number));
  },

  async deleteById(id) {
    await api.delete(`/comentario/${encodePath(id)}`);
    invalidateCache(MUTATION_SCOPES);
  },
};
