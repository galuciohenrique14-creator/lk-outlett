# LK Outlet

Loja virtual feita com React e Vite. O catálogo compartilhado e as fotos adicionadas pelo painel administrativo são armazenados no Supabase; os arquivos originais do catálogo ficam em `public/images`.

## Configuração

Siga as instruções em [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) para preparar o banco de dados, configurar as variáveis de ambiente e liberar o acesso seguro ao painel administrativo.

## Publicar na Vercel

Importe este repositório no Vercel e use:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis de ambiente da Vercel e faça um novo deploy sempre que alterar essas configurações.

## Rodar localmente

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Preencha as variáveis do `.env` com a Project URL e a chave pública do Supabase antes de usar o painel. Sem essas configurações, o catálogo de demonstração continua visível, mas não é possível publicar alterações compartilhadas.
