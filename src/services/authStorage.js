import { clearApiCache } from './cacheService';

const AUTH_KEY = 'insperMindAuth';
const AUTH_EVENT = 'insperMindAuthChanged';

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
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  localStorage.setItem('insperMindEmail', auth.email ?? '');
  localStorage.setItem('insperMindLogin', String(auth.loginResponse ?? ''));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth() {
  clearApiCache();
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
