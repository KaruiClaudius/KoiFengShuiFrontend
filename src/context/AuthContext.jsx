import { createContext, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getUser, setTokens, setUser as persistUser, clearAuth } from "../api/tokenManager.js";
import { logout as apiLogout } from "../api/auth.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser);

  const login = useCallback(({ newToken, newUser, email, token, refreshToken, expiresInMinutes, id, fullName, roleId }) => {
    setTokens({
      token: newToken ?? token,
      refreshToken,
      expiresInMinutes,
      id: newUser?.accountId ?? newUser?.id ?? id,
      fullName: newUser?.fullName ?? fullName,
      email: newUser?.email ?? email,
      roleId: newUser?.roleId ?? roleId,
    });
    if (newUser) persistUser(newUser);
    setUser(getUser());
  }, []);

  const updateUser = useCallback((nextUser) => {
    persistUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    apiLogout().catch(() => {});
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      isAdmin: user?.roleId === 1,
      login,
      logout,
      updateUser,
    }),
    [user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
