# Configuração do catálogo compartilhado

O catálogo usa o Supabase para que produtos, preços e fotos publicados pelo administrador apareçam para todos os visitantes.

## Preparar o Supabase

1. No Supabase Authentication, crie a conta do administrador com o e-mail `galuciohenrique33@gmail.com`.
2. No SQL Editor, execute [`supabase/setup.sql`](./supabase/setup.sql). A política permite alterações somente para o usuário Supabase de ID `ddedb3ad-cc32-4344-860d-9fd7169bbe58`, evitando depender do e-mail presente no token. Se estiver configurando outro projeto Supabase, substitua esse UUID pelo ID da conta administrativa desse projeto antes de executar o script.
3. Em **Project Settings → API**, copie a Project URL e a chave pública `anon`/publishable.
4. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no arquivo `.env` local e em **Vercel → Project Settings → Environment Variables**.
5. Faça um novo deploy no Vercel depois de configurar as variáveis.
6. Acesse `/admin/login` e entre com o e-mail e a senha da conta criada no Supabase.

No primeiro acesso administrativo, se ainda não houver produtos no banco, o catálogo inicial será publicado. Produtos e fotos cadastrados depois são enviados ao Supabase e ficam disponíveis no site para todos os usuários. O catálogo é sincronizado ao abrir o site, voltar para a aba e periodicamente enquanto a página estiver aberta.

As imagens são otimizadas no navegador e armazenadas no bucket público `product-images`. A chave `anon`/publishable é pública; **nunca** coloque a chave `service_role` no frontend, em variáveis `VITE_*` ou neste repositório.
