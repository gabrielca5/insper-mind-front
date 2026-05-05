const ADMIN_SESSION_KEY = 'insperMindAdminUnlocked';

export function readAdminAccess() {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveAdminAccess() {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } catch {
    // Admin access still works for the current render if storage is unavailable.
  }
}

export function clearAdminAccess() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
