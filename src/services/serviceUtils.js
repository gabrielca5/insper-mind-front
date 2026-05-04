export const DEFAULT_PAGE_SIZE = 20;

export function buildPageParams(pageOrParams = 0, size = DEFAULT_PAGE_SIZE, sort) {
  if (typeof pageOrParams === 'object' && pageOrParams !== null && !Array.isArray(pageOrParams)) {
    return {
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      ...pageOrParams,
    };
  }

  return {
    page: pageOrParams,
    size,
    ...(sort ? { sort } : {}),
  };
}

export function normalizePage(data, fallbackItems = []) {
  if (data && Array.isArray(data.content)) {
    return {
      ...data,
      items: data.content,
    };
  }

  if (Array.isArray(data)) {
    return {
      content: data,
      items: data,
      totalElements: data.length,
      totalPages: data.length > 0 ? 1 : 0,
      size: data.length,
      number: 0,
      numberOfElements: data.length,
      first: true,
      last: true,
      empty: data.length === 0,
    };
  }

  return {
    content: fallbackItems,
    items: fallbackItems,
    totalElements: fallbackItems.length,
    totalPages: fallbackItems.length > 0 ? 1 : 0,
    size: fallbackItems.length,
    number: 0,
    numberOfElements: fallbackItems.length,
    first: true,
    last: true,
    empty: fallbackItems.length === 0,
  };
}

export function normalizeList(data, fallbackItems = []) {
  return normalizePage(data, fallbackItems).items;
}

export function encodePath(value) {
  return encodeURIComponent(String(value));
}
