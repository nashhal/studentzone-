import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AppRole = "student" | "editor" | "admin";
type AuthValue = {
  session: Session | null; user: User | null; role: AppRole | null;
  loading: boolean; signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = async () => {
    if (!supabase) { setRole(null); return; }
    const { data: auth } = await supabase.auth.getSession();
    const id = auth.session?.user.id;
    if (!id) { setRole(null); return; }
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", id).maybeSingle();
    if (error) { console.error("Role lookup failed:", error.message); setRole(null); return; }
    setRole((data?.role as AppRole | undefined) ?? "student");
  };

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      await loadRole();
      if (alive) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      window.setTimeout(() => { void loadRole(); }, 0);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthValue>(() => ({
    session, user: session?.user ?? null, role, loading,
    signOut: async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setRole(null);
    },
  }), [session, role, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
