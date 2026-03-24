# EcoTech

Site estático escolar sobre lixo eletrônico, descarte correto e ecopontos em Araçatuba-SP.

## Estrutura do projeto

```text
src/
  assets/     arquivos visuais
  data/       dados e fontes estruturadas
  pages/      páginas-fonte do site
  site.js     comportamento global
  styles.css  estilos globais

scripts/
  build_site.py       gera o site final em dist/
  check_site.py       valida HTML, CSS, JSON-LD e dados
  update_ecopoints.py atualiza a base local a partir da fonte oficial
  generate_icons.py   recria os icones PWA

dist/
  saída pronta para publicação
```

## Como rodar localmente

No Windows, dentro da pasta do projeto:

```powershell
.\localhost.cmd
```

Para trocar a porta:

```powershell
.\localhost.cmd 5501
```

O script gera a pasta `dist/` antes de iniciar o servidor local.

## Como editar o conteúdo

Edite apenas os arquivos em `src/`:

- `src/pages/*.html`: estrutura e conteúdo das páginas
- `src/styles.css`: estilos do site
- `src/site.js`: comportamento global e filtros do mapa
- `src/site.config.json`: navegação, SEO, manifest e dados globais
- `src/data/ecopontos-aracatuba.json`: base única dos ecopontos e catálogo de materiais
- `src/data/ecopoints-geo.json`: coordenadas e aliases usados para atualizar a base oficial sem perder os IDs
- `src/data/resources.json`: base única dos artigos, vídeos e fontes em destaque

## Build

Para gerar manualmente a versão publicada:

```powershell
py scripts\build_site.py
```

Esse script:

- limpa e recria `dist/`
- injeta cabeçalho e rodapé compartilhados
- gera SEO e JSON-LD de cada página
- monta os cartões de ecopontos a partir da base de dados
- gera `site.webmanifest`
- gera `robots.txt`
- gera `sitemap.xml`
- gera `.nojekyll`
- valida referências locais na saída final

Para rodar as checagens extras de HTML, CSS e acessibilidade básica:

```powershell
py scripts\check_site.py
```

Esse script também valida:

- estrutura dos arquivos JSON em `src/data/`
- consistência entre navegação, páginas e assets
- coerência da base `src/data/ecopoints-geo.json`
- presença dos ícones declarados no manifest
- presença de dimensões nas imagens geradas

## Atualização dos ecopontos

Quando a Prefeitura de Araçatuba atualizar os ecopontos, rode:

```powershell
py scripts\update_ecopoints.py
```

Depois disso, regenere a saída:

```powershell
py scripts\build_site.py
py scripts\check_site.py
```

O arquivo `src/data/ecopoints-geo.json` mantém os IDs, aliases e coordenadas usadas para casar os pontos da fonte oficial com a base do site.

## Qualidade visual

O repositório também tem uma esteira de qualidade em `.github/workflows/site-quality.yml` que:

- gera o build final
- roda `check_site.py`
- executa Lighthouse na home e na página de ecopontos
- captura screenshots desktop e mobile com Playwright

Se quiser rodar essa parte localmente:

```powershell
npm.cmd install
npx playwright install chromium
```

## Publicação

O projeto agora está preparado para deploy direto no Vercel.

O arquivo `vercel.json` já define:

- comando de build
- diretório final `dist/`
- headers básicos de cache e segurança

No Vercel, basta importar o repositório. As URLs canônicas e o sitemap usam automaticamente `VERCEL_PROJECT_PRODUCTION_URL` ou `SITE_URL` quando esses valores estiverem disponíveis no ambiente.

## Observações

- `dist/` é saída gerada e não deve ser usado como fonte de edição
- os cartões de ecopontos e os blocos de fontes em destaque são gerados a partir dos arquivos em `src/data/`
- o GitHub Actions agora faz checagens de qualidade; o deploy fica por conta do Vercel
