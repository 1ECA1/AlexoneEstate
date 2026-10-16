import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import { TOKEN_KEY } from "../services/api";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while we check a previously saved login when the app first opens
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_KEY))
  );

  // On first load: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    let ignore = false;

    fetchCurrentUser()
      .then((currentUser) => {
        if (!ignore) setUser(currentUser);
      })
      .catch((error) => {
        // Only log out if the server says the token is bad. A server that is
        // temporarily down should not sign everyone out.
        if (error.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const saveSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    async (credentials) => saveSession(await loginUser(credentials)),
    [saveSession]
  );

 const register = useCallback(
  async (details) => registerUser(details),
  []
);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}