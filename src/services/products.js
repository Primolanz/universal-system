import { requireSupabase } from '../lib/supabase';
import { slugify } from '../utils';
const db = () => requireSupabase().from('products');
const select = '*, categories(id,name,slug)';
const productPayload = data => ({ name:data.name, slug:slugify(data.name), description:data.description || '', price:Number(data.price), stock:Number(data.stock), category_id:data.category_id, image_path:data.image_path || null, active:Boolean(data.active) });
export const getProducts = active => { const query=db().select(select).order('created_at',{ascending:false}); return active ? query.eq('active',true) : query; };
export const getProductById=id=>db().select(select).eq('id',id).single();
export const createProduct=data=>db().insert(productPayload(data)).select().single();
export const updateProduct=(id,data)=>db().update(productPayload(data)).eq('id',id).select().single();
// Atualiza somente o estoque, evitando que alterações rápidas sobrescrevam
// os demais dados do produto.
export const updateProductStock=(id,stock)=>db().update({stock:Number(stock)}).eq('id',id).select().single();
export const toggleProductStatus=(id,active)=>db().update({active}).eq('id',id);
export const deleteProduct=id=>db().delete().eq('id',id);
