# EcoTech

Site escolar em `Next.js` sobre lixo eletronico, descarte correto e ecopontos em Aracatuba e regiao. O projeto foi reconstruido para deploy direto no Vercel, leitura rapida no celular e acesso simples por QR code.

## Stack

- `Next.js 16` com App Router
- `React 19`
- `Tailwind CSS 4`
- `TypeScript`
- `Route Handlers` do Next para APIs publicas
- `Vitest` para testes de logica
- `Playwright` para testes E2E

## Estrutura

```text
app/                      rotas, layout, metadata, APIs e arquivos especiais do Next
public/assets/            imagens, SVGs e icones publicos
src/components/common/    blocos visuais compartilhados entre paginas
src/components/layout/    header e footer globais
src/components/ecopoints/ interface interativa dos pontos de descarte
src/components/resources/ apresentacao das fontes e referencias
src/content/              textos e blocos estaticos das paginas
src/data/                 JSONs versionados do site, ecopontos e fontes
src/lib/                  schemas, helpers, SEO e logica de negocio
scripts/                  manutencao local, incluindo atualizacao dos ecopontos
tests/unit/               testes de logica e scripts
tests/e2e/                cenarios Playwright
```

## Como rodar localmente

Instale as dependencias:

```powershell
npm.cmd install
```

Inicie o ambiente:

```powershell
.\localhost.cmd
```

Ou direto com npm:

```powershell
npm.cmd run dev
```

## Comandos principais

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd run test:e2e
```

Para instalar o Chromium do Playwright e rodar os testes E2E:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

## Dados e manutencao

Os dados continuam versionados no repositorio:

- `src/data/site.config.json`
- `src/data/ecopontos-aracatuba.json`
- `src/data/ecopoints-geo.json`
- `src/data/resources.json`

Quando a Prefeitura de Aracatuba atualizar os ecopontos, rode:

```powershell
npm.cmd run update:ecopoints
```

O script consulta a fonte oficial, reconstrui `src/data/ecopontos-aracatuba.json` e preserva os aliases e IDs definidos em `src/data/ecopoints-geo.json`.

## Qualidade automatizada

O repositório já possui workflow em `.github/workflows/site-quality.yml` com:

- `lint`
- `typecheck`
- testes unitários com `Vitest`
- `build` de produção
- testes E2E com `Playwright`

Em CI o projeto usa `Node 24`, igual ao `engines.node` do `package.json`.

## APIs publicas

- `GET /api/ecopoints`
- `GET /api/resources`

## Deploy no Vercel

O projeto foi preparado para deploy direto no Vercel sem depender de Python. Basta importar o repositorio. As URLs canonicas usam automaticamente `SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL` ou `VERCEL_URL` quando esses valores estiverem disponiveis.

O fallback versionado usa `https://eco-tech-jade.vercel.app/`. Se o site for publicado em outro dominio ou ambiente, defina `SITE_URL`.

## Checklist de publicacao

Antes de publicar ou atualizar a versao em producao:

1. Rode `npm.cmd run lint`.
2. Rode `npm.cmd run typecheck`.
3. Rode `npm.cmd run test`.
4. Rode `npx.cmd playwright install chromium` se for a primeira execucao local.
5. Rode `npm.cmd run test:e2e`.
6. Rode `npm.cmd run build`.
7. Confirme `SITE_URL` no dominio final, se nao for usar a URL padrao do projeto.
