# RushHub — Beta com sistema automático de corridas

## O que foi automatizado
- Status das 85 corridas: PRÓXIMA, AO VIVO, ENCERRADA ou CANCELADA.
- Countdown automático para a próxima corrida.
- Contador/progresso automático durante a janela estimada da corrida.
- Os 6 calendários usam a mesma base `JS/dados-corridas.js`.
- Todas as páginas de corrida usam o mesmo `JS/corrida.js`.
- F1: páginas encerradas tentam carregar classificação histórica e páginas futuras tentam carregar o campeonato pelo OpenF1.

## O que NÃO é inventado
- O sistema não fabrica posições, gaps, pit stops ou voltas ao vivo.
- Telemetria/posição F1 em tempo real pelo OpenF1 exige assinatura; o histórico é disponibilizado gratuitamente pela API.
- Para WEC, F2, Stock Car, Porsche Cup e Formula E, ainda é necessário conectar uma fonte de timing da categoria para transformar o painel em live timing real.

## Vídeos/transmissões
O RushHub deve incorporar apenas players/links de transmissão ou melhores momentos que sejam autorizados pelo detentor dos direitos. O campo `videoUrl` já existe na base para isso.

## Horários sem horário específico
Quando o calendário original não trazia um horário de largada, o sistema usa 12:00 (horário de Brasília) como horário-base do countdown. Isso pode ser alterado em um único lugar: `JS/dados-corridas.js`.

## Arquivos principais
- `JS/dados-corridas.js` — banco simples das etapas.
- `JS/corrida.js` — motor das páginas de corrida.
- `JS/calendario.js` — motor dos calendários.
- `CSS/rush-auto.css` — visual dos componentes automáticos.
