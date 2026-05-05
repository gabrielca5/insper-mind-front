const THEME_KEY = 'insperMindTheme';
const THEME_EVENT = 'insperMindThemeChanged';

export const THEMES = {
  dark: 'dark',
  light: 'light',
};

function isValidTheme(theme) {
  return theme === THEMES.dark || theme === THEMES.light;
}

export function readTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_KEY);
    return isValidTheme(storedTheme) ? storedTheme : THEMES.dark;
  } catch {
    return THEMES.dark;
  }
}

export function applyTheme(theme = readTheme()) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = isValidTheme(theme) ? theme : THEMES.dark;
}

export function saveTheme(theme) {
  const nextTheme = isValidTheme(theme) ? theme : THEMES.dark;

  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch {
    // The visual theme can still be applied even when storage is unavailable.
  }

  applyTheme(nextTheme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function toggleTheme(currentTheme = readTheme()) {
  const nextTheme = currentTheme === THEMES.dark ? THEMES.light : THEMES.dark;
  saveTheme(nextTheme);
  return nextTheme;
}

export function listenTheme(callback) {
  const handler = () => callback(readTheme());

  window.addEventListener(THEME_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(THEME_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
