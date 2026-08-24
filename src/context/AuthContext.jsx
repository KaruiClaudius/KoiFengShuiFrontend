import PropTypes from "prop-types";
import { useAuthStore, selectIsLoggedIn, selectIsAdmin } from "../stores/authStore.js";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const isAdmin = useAuthStore(selectIsAdmin);

  return { user, isLoggedIn, isAdmin, login, logout, updateUser };
};

export const AuthProvider = ({ children }) => children;

AuthProvider.propTypes = {
  children: PropTypes.node,
};
