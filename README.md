# Template Universal de Loja

Catálogo React/Vite ligado ao Supabase, com carrinho persistente e checkout pelo WhatsApp.

## Instalação

1. Execute npm install.
2. Copie .env.example para .env e informe URL e Publishable Key do Supabase.
3. No SQL Editor, execute supabase/schema.sql.
4. Crie um usuário por e-mail/senha no Supabase Auth.
5. Adicione o perfil: insert into public.profiles(id,full_name,role) values ('UUID','Administrador','admin');
6. Execute npm run dev.

## White-label

Edite src/config/store.js: nome, descrição, WhatsApp, logo, cores, moeda e bucket. Nunca use Service Role Key no frontend.

## Checklist

- [ ] Criar projeto Supabase
- [ ] Configurar .env
- [ ] Executar schema.sql
- [ ] Criar usuário e profile admin
- [ ] Alterar STORE_CONFIG
- [ ] Testar upload, catálogo, carrinho e WhatsApp
- [ ] Executar npm run build

## Deploy

Execute npm run build e publique dist. Configure as duas variáveis VITE no provedor.