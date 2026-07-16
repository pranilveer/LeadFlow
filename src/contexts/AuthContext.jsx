import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { bootstrap, getSession, setSession as storeSession, clearSession as storeClearSession, authenticate as authUser, isAdmin as checkAdmin } from "../utils/storage";

bootstrap();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession());

  const login = useCallback((username, password, remember) => {
    const user = authUser(username, password);
    if (!user) return null;
    const s = storeSession(user, remember);
    setSessionState(s);
    return s;
  }, []);

  const logout = useCallback(() => {
    storeClearSession();
    setSessionState(null);
  }, []);

  const refreshSession = useCallback(() => {
    setSessionState(getSession());
  }, []);

  useEffect(() => {
    if (!session) return;
    const stored = getSession();
    if (stored && stored.userId !== session.userId) setSessionState(stored);
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, login, logout, refreshSession, isAdmin: checkAdmin(session) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
