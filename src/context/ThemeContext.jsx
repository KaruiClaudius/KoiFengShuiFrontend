import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";

const THEME_STORAGE_KEY = "theme";

const ThemeContext = createContext(null);

const normalizeTheme = (value) => (value === "dark" ? "dark" : "light");

const readStoredTheme = () => {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "light";
  }
};

const persistTheme = (nextTheme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    return;
  }
};

export const applyTheme = (nextTheme) => {
  document.documentElement.dataset.theme = normalizeTheme(nextTheme);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme) => {
    setThemeState(normalizeTheme(nextTheme));
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  const [fallbackTheme, setFallbackTheme] = useState(readStoredTheme);

  useEffect(() => {
    if (ctx) return undefined;
    applyTheme(fallbackTheme);
    persistTheme(fallbackTheme);
    return undefined;
  }, [ctx, fallbackTheme]);

  if (ctx) return ctx;

  const setTheme = (nextTheme) => setFallbackTheme(normalizeTheme(nextTheme));
  const toggle = () =>
    setFallbackTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return { theme: fallbackTheme, setTheme, toggle };
};
