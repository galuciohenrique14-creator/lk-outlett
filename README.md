# LK Outlet

Loja virtual estática feita com React e Vite. As fotos do catálogo ficam em `public/images` e são servidas pelo próprio site em `/images/...`.

## Publicar na Vercel

Importe este repositório no Vercel e use:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Não é necessário configurar variáveis de ambiente nem conectar serviços externos.

## Rodar localmente

```bash
npm install
npm run dev
```

O painel e as alterações de produtos ficam armazenados no navegador usado. Como este projeto não usa um serviço de banco de dados, essas alterações não são compartilhadas automaticamente com outros clientes ou dispositivos. Para publicar mudanças permanentes no catálogo ou nas fotos originais, atualize os arquivos do projeto e faça um novo deploy.
