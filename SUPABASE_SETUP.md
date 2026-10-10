# Catálogo compartilhado da LK Outlet

O catálogo da loja usa o Supabase para compartilhar produtos, preços, promoções e imagens entre dispositivos. O acesso administrativo permanece desativado até o Supabase estar configurado; não há senha administrativa embutida no código.

## Preparação do Supabase

1. Crie um projeto Supabase e execute [`supabase/setup.sql`](./supabase/setup.sql) uma vez no SQL Editor.
2. Crie a conta de e-mail/senha do administrador para `galuciohenrique14@gmail.com`. As políticas RLS e as políticas de imagens autorizam escrita somente para esse e-mail autenticado.
3. Copie a Project URL e a chave `anon`/publishable do projeto.
4. Configure estas variáveis no ambiente local e em Vercel → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Faça novo deploy depois de adicionar as variáveis.
6. Entre em `/admin/login` usando o e-mail e a senha cadastrados no Supabase. No primeiro acesso autenticado, se a tabela remota estiver vazia, os produtos iniciais do catálogo são copiados para o projeto; caso contrário, os produtos remotos existentes são mantidos.

A chave `anon` é pública e pode ser usada no frontend; não configure a chave `service_role` no Vite, no navegador ou em variáveis `VITE_*`. As alterações de escrita são protegidas por autenticação do Supabase e pelas políticas RLS criadas no SQL.
