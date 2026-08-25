import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
const C = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [profile, setProfile] = useState(null),
    [loading, setLoading] = useState(true);
  const load = async (u) => {
    if (!u || !supabase) return setProfile(null);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    setProfile(data || null);
  };
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      load(data.session?.user).finally(() => setLoading(false));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user || null);
      load(s?.user);
    });
    return () => subscription.unsubscribe();
  }, []);
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };
  return (
    <C.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout: () => supabase.auth.signOut(),
      }}
    >
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
