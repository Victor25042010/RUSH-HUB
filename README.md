# RUSH HUB — Fórmula 1

Hub de F1 pensado para GitHub Pages, com separação entre dados, interface e automação.

## Estado da versão

### Funcionando
- Home responsiva.
- Loading screen.
- Calendário consumindo `data/calendar.json`.
- Fallback para consulta da API Jolpica.
- Página dinâmica de corrida por `year` e `round`.
- Estrutura de campeonatos.
- Botão voltar ao topo.
- GitHub Actions para atualização periódica do calendário.

### Preparado
- Resultados completos por sessão.
- Persistência de resultados.
- Mapas reais versionados por circuito.
- Vídeos e transmissões incorporáveis.
- Camada de live timing.

### Não fingido
O OpenF1 documenta dados históricos gratuitos a partir de 2023, enquanto dados em tempo real exigem assinatura. Portanto, esta versão não apresenta dados live inventados.

## Publicação no GitHub Pages

1. Suba os arquivos para `Victor25042010/RUSH-HUB`.
2. Em Settings → Pages, selecione GitHub Actions como método de publicação.
3. Aguarde o workflow de Pages.
4. Execute `Update RUSH HUB F1 data` manualmente na primeira vez para preencher `data/calendar.json`.

## Observação

O arquivo `assets/video/f1-hero.mp4` não é incluído de propósito: o projeto não assume direitos de um vídeo externo. O fallback SVG funciona sem esse arquivo.
