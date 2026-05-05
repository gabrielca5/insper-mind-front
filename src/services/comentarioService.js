import api from './api';
import { cachedGet, createCacheKey, invalidateCache } from './cacheService';
import { buildPageParams, encodePath, normalizeList, normalizePage } from './serviceUtils';

const CACHE_RESOURCE = 'comentario-db';
const CACHE_SCOPE = `${CACHE_RESOURCE}:`;
const MUTATION_SCOPES = [CACHE_SCOPE, 'material-db:', 'material:'];
const COMMENT_LIKES_KEY = 'insperMindCommentLikes';
const COMMENT_MATERIAL_MAP_KEY = 'insperMindCommentMaterialMap';

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

function getStoredCommentMaterialMap() {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(COMMENT_MATERIAL_MAP_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveStoredCommentMaterialMap(map) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(COMMENT_MATERIAL_MAP_KEY, JSON.stringify(map));
  } catch {
    // O vínculo também pode vir da API; se o storage falhar, só perdemos o apoio local.
  }
}

function rememberCommentMaterial(commentId, materialId) {
  const normalizedCommentId = normalizeId(commentId);
  const normalizedMaterialId = normalizeId(materialId);

  if (!normalizedCommentId || !normalizedMaterialId) return;

  const map = getStoredCommentMaterialMap();
  map[normalizedCommentId] = normalizedMaterialId;
  saveStoredCommentMaterialMap(map);
}

function forgetCommentMaterial(commentId) {
  const normalizedCommentId = normalizeId(commentId);
  if (!normalizedCommentId) return;

  const map = getStoredCommentMaterialMap();
  delete map[normalizedCommentId];
  saveStoredCommentMaterialMap(map);
}

function getRememberedCommentMaterialId(commentId) {
  const normalizedCommentId = normalizeId(commentId);
  if (!normalizedCommentId) return null;

  return normalizeId(getStoredCommentMaterialMap()[normalizedCommentId]);
}

function getCommentMaterialId(comment) {
  return normalizeId(
    comment?.materialId ??
    comment?.idMaterial ??
    comment?.material?.id ??
    getRememberedCommentMaterialId(comment?.id)
  );
}

function withRememberedMaterialId(comment) {
  if (!comment) return comment;

  const materialId = getCommentMaterialId(comment);
  return materialId ? { ...comment, materialId } : comment;
}

function normalizeComentarioPayload(dto = {}) {
  const materialId = normalizeId(dto.materialId ?? dto.idMaterial ?? dto.material?.id);
  const idDisciplina = normalizeId(dto.idDisciplina ?? dto.disciplinaId ?? dto.disciplina?.id);
  const { disciplinaId, material, disciplina, ...rest } = dto;

  if (!materialId) {
    throw new Error('Comentário precisa estar vinculado a um material.');
  }

  return {
    ...rest,
    materialId,
    idMaterial: materialId,
    ...(idDisciplina ? { idDisciplina } : {}),
  };
}

function normalizeComentarioList(data) {
  return normalizeList(data).map(withRememberedMaterialId);
}

function normalizeComentarioPage(data) {
  const page = normalizePage(data);
  const items = page.items.map(withRememberedMaterialId);

  return {
    ...page,
    content: items,
    items,
  };
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
      return normalizeComentarioList(data);
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
      return normalizeComentarioPage(data);
    } catch {
      return normalizePage(null);
    }
  },

  async listByMaterial(materialId, page = 0, size = 20) {
    const normalizedMaterialId = normalizeId(materialId);
    if (!normalizedMaterialId) return [];

    try {
      const requestParams = buildPageParams({
        page: 0,
        size: Math.max(size, 250),
        materialId: normalizedMaterialId,
        idMaterial: normalizedMaterialId,
      });
      const cacheParams = { ...requestParams, requestedPage: page };
      const data = await cachedGet(createCacheKey(CACHE_RESOURCE, 'by-material', cacheParams), async () => {
        const response = await api.get('/comentario', {
          params: requestParams,
        });
        return response.data;
      });
      return normalizeComentarioList(data).filter(
        (comment) => getCommentMaterialId(comment) === normalizedMaterialId
      );
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
      return normalizeComentarioList(data);
    } catch {
      return [];
    }
  },

  async save(dto) {
    const payload = normalizeComentarioPayload(dto);
    const response = await api.post('/comentario', payload);
    const saved = withRememberedMaterialId({
      ...response.data,
      materialId: response.data?.materialId ?? response.data?.idMaterial ?? payload.materialId,
    });

    rememberCommentMaterial(saved?.id, payload.materialId);
    invalidateCache(MUTATION_SCOPES);
    return saved;
  },

  async update(id, dto) {
    const response = await api.put(`/comentario/${encodePath(id)}`, dto);
    const updated = withRememberedMaterialId(response.data);
    invalidateCache(MUTATION_SCOPES);
    return updated;
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

  getMaterialId(comment) {
    return getCommentMaterialId(comment);
  },

  async deleteById(id) {
    await api.delete(`/comentario/${encodePath(id)}`);
    forgetCommentMaterial(id);
    invalidateCache(MUTATION_SCOPES);
  },
};
