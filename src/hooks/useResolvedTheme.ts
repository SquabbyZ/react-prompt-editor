import { useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

const getDocumentDarkMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const html = document.documentElement;
  return (
    html.classList.contains('dark') ||
    html.getAttribute('data-theme') === 'dark' ||
    html.getAttribute('data-prefers-color') === 'dark' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
};

export const useResolvedTheme = (theme: ThemeMode = 'system') => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return getDocumentDarkMode();
  });

  useEffect(() => {
    if (theme === 'dark') {
      setIsDarkMode(true);
      return;
    }

    if (theme === 'light') {
      setIsDarkMode(false);
      return;
    }

    const syncTheme = () => {
      setIsDarkMode(getDocumentDarkMode());
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-prefers-color'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', syncTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', syncTheme);
    };
  }, [theme]);

  return {
    isDarkMode,
    resolvedTheme: isDarkMode ? 'dark' : 'light',
  };
};
