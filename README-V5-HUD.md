# RushHub V5 — Race Command HUD

## Novidades
- Painel de comando em todas as 85 corridas.
- Sistema de transmissão por corrida/data: `admin-transmissoes.html` encontra a corrida cadastrada para o dia e salva a emissora/link.
- Transmissões personalizadas ficam no navegador via localStorage; o painel permite exportar a configuração para publicação estática.
- Piloto do dia pode ser definido pelo painel. Sem definição, o sistema usa o vencedor da etapa como destaque automático.
- Banner de vencedor + efeito de confetes em páginas F1 encerradas.
- Onboard control em WEC, Formula E, Stock Car e Porsche Cup. F1 e F2 ficam fora, como solicitado.
- WEC inclui duas onboards oficiais verificadas como exemplos; os demais pilotos usam busca oficial até que um vídeo específico seja cadastrado.
- Relógio e estado da corrida no HUD.
- Não copia sinal protegido: links externos/players só são usados quando fornecidos oficialmente.

## Como adicionar uma transmissão
1. Abra `admin-transmissoes.html`.
2. Escolha a data e, se quiser, a categoria.
3. O RushHub encontra a corrida daquela data.
4. Informe emissora/lugar e link oficial.
5. Salve.
6. Para publicar a mesma configuração para todos os visitantes em hospedagem estática, use `EXPORTAR CONFIGURAÇÃO` e substitua a configuração correspondente no projeto.

## Observação
O armazenamento local é por navegador. Um site estático sem backend não consegue gravar uma alteração feita por um usuário para todos os visitantes. Por isso existe a exportação da configuração.
