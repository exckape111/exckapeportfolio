import { useCallback, useSyncExternalStore } from 'react';

export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    useCallback((onChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    }, [query]),
    () => window.matchMedia(query).matches,
    () => false,
  );
