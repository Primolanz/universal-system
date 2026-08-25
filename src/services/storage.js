import {
    requireSupabase
} from '../lib/supabase';
import {
    STORE_CONFIG
} from '../config/store';
const allowed = ['image/jpeg', 'image/png', 'image/webp'];
export async function uploadProductImage(f) {
    if (!allowed.includes(f.type)) throw new Error('Use JPG, PNG ou WEBP.');
    if (f.size > 5242880) throw new Error('A imagem deve ter no máximo 5 MB.');
    const p = 'products/' + crypto.randomUUID() + '.' + f.name.split('.').pop().toLowerCase(),
        {
            error
        } = await requireSupabase().storage.from(STORE_CONFIG.storageBucket).upload(p, f, {
            contentType: f.type
        });
    if (error) throw error;
    return p
};
export const deleteProductImage = p => p ? requireSupabase().storage.from(STORE_CONFIG.storageBucket).remove([p]) : Promise.resolve();
export const getProductImageUrl = p => p ? requireSupabase().storage.from(STORE_CONFIG.storageBucket).getPublicUrl(p).data.publicUrl : ''