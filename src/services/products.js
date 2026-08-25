import {
    requireSupabase
} from '../lib/supabase';
import {
    slugify
} from '../utils';
const db = () => requireSupabase().from('products'),
    select = '*, categories(id,name,slug)';
export const getProducts = a => {
    const q = db().select(select).order('created_at', {
        ascending: false
    });
    return a ? q.eq('active', true) : q
};
export const getProductById = id => db().select(select).eq('id', id).single();
export const createProduct = d => db().insert({
    ...d,
    slug: slugify(d.name)
}).select().single();
export const updateProduct = (id, d) => db().update({
    ...d,
    slug: slugify(d.name)
}).eq('id', id).select().single();
export const toggleProductStatus = (id, active) => db().update({
    active
}).eq('id', id);
export const deleteProduct = id => db().delete().eq('id', id)