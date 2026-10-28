import { DEMO_MODE } from "@/lib/env";
import { db, DEMO_ACCOUNTS } from "@/services/mock/seed";
import { delay, http, setToken } from "./http";
import type { AuthTokens, LoginPayload, RegisterPayload, User } from "@/types";

const SESSION_KEY = "asgip.session";

function saveSession(user: User) {
  if (typeof window !== "undefined")
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function loadSession(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}
function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}

export const authApi = {
  async login(payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> {
    if (DEMO_MODE) {
      const acct = DEMO_ACCOUNTS.find((a) => a.email === payload.email.toLowerCase().trim());
      if (!acct || payload.password.length < 3) throw new Error("Invalid credentials");
      const user = db().users.find((u) => u.email === acct.email)!;
      const tokens = { accessToken: `demo.${user.id}`, refreshToken: `demo.refresh.${user.id}` };
      setToken(tokens.accessToken);
      saveSession(user);
      return delay({ user, tokens });
    }
    const result = await http<{ user: User; tokens: AuthTokens }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(result.tokens.accessToken);
    saveSession(result.user);
    return result;
  },

  async register(payload: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }> {
    if (DEMO_MODE) {
      const user: User = {
        id: `cit-${Date.now()}`,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        role: "CITIZEN",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      db().users.push(user);
      const tokens = { accessToken: `demo.${user.id}`, refreshToken: `demo.refresh.${user.id}` };
      setToken(tokens.accessToken);
      saveSession(user);
      return delay({ user, tokens });
    }
    const result = await http<{ user: User; tokens: AuthTokens }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(result.tokens.accessToken);
    saveSession(result.user);
    return result;
  },

  async logout(): Promise<void> {
    setToken(null);
    clearSession();
    if (!DEMO_MODE) await http<void>("/auth/logout", { method: "POST" }).catch(() => {});
  },

  async forgotPassword(email: string): Promise<void> {
    if (DEMO_MODE) return delay(undefined);
    await http<void>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    if (DEMO_MODE) return delay(undefined);
    await http<void>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
  },

  currentUser(): User | null {
    return loadSession();
  },
};
