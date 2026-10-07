# RUSH HUB — visual rebuild
Interface reconstruída com referência de linguagem editorial/esportiva: navegação minimalista, tipografia grande, blocos de conteúdo, calendário como conteúdo principal e destaque para o próximo GP.
A referência visual foi estudada em landonorris.com, mas o layout/código são próprios.
## Correções
- calendário agora possui dados reais de calendário no JSON e renderização client-side;
- tabelas deixam de depender de placeholders vazios;
- caminhos relativos foram separados por página;
- loader não usa carro 3D fake;
- área 3D usa apenas o viewer incorporado do Sketchfab;
- dados ausentes continuam como “—” para não inventar informação.
