import {
    createClient
} from '@supabase/supabase-js';
const url =
    import.meta.env.VITE_SUPABASE_URL,
    key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export const requireSupabase = () => {
    if (!supabase) throw new Error('Configure as variáveis do Supabase para continuar.');
    return supabase
}