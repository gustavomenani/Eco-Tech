# Quality Audit

Data: 2026-04-12

## Escopo

- Pipeline de qualidade
- Testes unitarios e E2E
- UX/performance com foco em mobile
- Preparacao para publicacao

## Ajustes aplicados

- CI alinhado com `Node 24` e com upload do relatorio do Playwright em falha.
- Cobertura ampliada para navegacao mobile, filtro por cidade e helpers de URL/metadata.
- Validacoes de dados endurecidas para detectar referencias quebradas e duplicatas no carregamento.
- Script de atualizacao dos ecopontos protegido contra drift silencioso na estrutura HTML.

## Auditoria tecnica

- Mobile first:
  o projeto continua estatico e leve, com imagens otimizadas via `next/image`, rotas prerenderizadas e sem fetch client-side pesado.
- Navegacao:
  o menu mobile foi ajustado para nao ficar preso apos mudanca de rota.
- Dados:
  os JSONs agora falham cedo em caso de IDs duplicados, materiais desconhecidos ou listas curadas inconsistentes.
- Publicacao:
  o README agora inclui fluxo de verificacao antes de deploy.

## Riscos residuais

- O mapa depende de `iframe` externo do OpenStreetMap; o fallback esquematico reduz falha visual, mas nao elimina dependencia de terceiro.
- O script `update-ecopoints` ainda depende de mudancas na pagina fonte; agora ele falha de forma explicita, mas a manutencao continua exigindo revisao humana quando a estrutura externa mudar.
- Ainda nao existe medicao automatizada de Web Vitals ou Lighthouse no CI.

## Proximos passos recomendados

1. Adicionar monitoramento de Web Vitals em ambiente publicado e acompanhar o dashboard do Vercel.
2. Se o projeto ganhar mais interacoes client-side, introduzir testes de acessibilidade e snapshots visuais.
3. Sempre revisar os dados de `ecopontos` apos rodar o script de atualizacao, mesmo com os schemas mais rigidos.
