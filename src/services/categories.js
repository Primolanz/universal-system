import {
    requireSupabase
} from '../lib/supabase';
import {
    slugify
} from '../utils';
const db = () => requireSupabase().from('categories');
export const getCategories = a => {
    const q = db().select('*').order('name');
    return a ? q.eq('active', true) : q
};
export const createCategory = d => db().insert({
    ...d,
    slug: slugify(d.name)
}).select().single();
export const updateCategory = (id, d) => db().update({
    ...d,
    slug: slugify(d.name)
}).eq('id', id).select().single();
export const toggleCategoryStatus = (id, active) => db().update({
    active
}).eq('id', id);
export const deleteCategory = id => db().delete().eq('id', id)