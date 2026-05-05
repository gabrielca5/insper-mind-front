import { clearApiCache } from './cacheService';
import { clearAdminAccess } from './adminAccessStorage';

const AUTH_KEY = 'insperMindAuth';
const AUTH_EVENT = 'insperMindAuthChanged';
const FAVORITO_ITEM_MAP_KEY = 'insperMindFavoriteItemMap';
const FAVORITO_REMOVED_KEY = 'insperMindRemovedFavorites';

function clearFavoriteLocalState() {
  localStorage.removeItem(FAVORITO_ITEM_MAP_KEY);
  localStorage.removeItem(FAVORITO_REMOVED_KEY);
}

export function readAuth() {
  const raw = localStorage.getItem(AUTH_KEY);

  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
  }

  const legacyEmail = localStorage.getItem('insperMindEmail');
  const legacyLogin = localStorage.getItem('insperMindLogin');

  if (legacyEmail || legacyLogin) {
    return {
      email: legacyEmail ?? '',
      loginResponse: legacyLogin ?? '',
    };
  }

  return null;
}

export function saveAuth(auth) {
  clearApiCache();
  clearAdminAccess();
  clearFavoriteLocalState();
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  localStorage.setItem('insperMindEmail', auth.email ?? '');
  localStorage.setItem('insperMindLogin', String(auth.loginResponse ?? ''));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth() {
  clearApiCache();
  clearAdminAccess();
  clearFavoriteLocalState();
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem('insperMindEmail');
  localStorage.removeItem('insperMindLogin');
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function listenAuth(callback) {
  const handler = () => callback(readAuth());

  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
