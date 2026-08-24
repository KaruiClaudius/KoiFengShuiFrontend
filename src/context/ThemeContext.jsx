import PropTypes from "prop-types";
import { useThemeStore } from "../stores/themeStore.js";

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggle = useThemeStore((state) => state.toggle);

  return { theme, setTheme, toggle };
};

export const ThemeProvider = ({ children }) => children;

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
