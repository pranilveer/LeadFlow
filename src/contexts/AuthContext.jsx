import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getSession, login as apiLogin, register as apiRegister, logout as apiLogout, isAdmin as checkAdmin } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession());

  const login = useCallback(async (username, password, remember) => {
    const s = await apiLogin(username, password, remember);
    setSessionState(s);
    return s;
  }, []);

  const register = useCallback(async (username, password, name, email) => {
    const s = await apiRegister(username, password, name, email);
    setSessionState(s);
    return s;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setSessionState(null);
  }, []);

  const refreshSession = useCallback(() => {
    setSessionState(getSession());
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, register, logout, refreshSession, isAdmin: checkAdmin(session) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
