/* RUSHHUB — arquivo de melhores momentos oficiais por temporada/categoria.
   Usa apenas fontes oficiais; quando não existe um vídeo individual verificado,
   abre a busca oficial da categoria/ano em vez de inventar um link.
*/
(() => {
  const path = location.pathname;
  const file = path.split('/').pop().replace('.html','');
  const category = ({f1:'F1',f2:'F2',wec:'WEC',stockcar:'Stock Car',porschecup:'Porsche Cup',formulae:'Fórmula E'})[file] ||
                   (file.startsWith('f1-') ? 'F1' : null);
  if (!category) return;

  const sources = {
    'F1': y => y === 2026 ? 'https://www.formula1.com/en/video' : `https://www.formula1.com/en/video?search=${encodeURIComponent('race highlights '+y)}`,
    'F2': y => `https://www.youtube.com/@Formula2/search?query=${encodeURIComponent('race highlights '+y)}`,
    'WEC': y => `https://www.youtube.com/@FIAWEC/search?query=${encodeURIComponent('race highlights '+y)}`,
    'Stock Car': y => `https://www.youtube.com/@StockCarBRB/search?query=${encodeURIComponent('melhores momentos '+y)}`,
    'Porsche Cup': y => `https://www.youtube.com/@PorscheCupBrasil/search?query=${encodeURIComponent('melhores momentos '+y)}`,
    'Fórmula E': y => `https://www.youtube.com/@FIAFormulaE/search?query=${encodeURIComponent('race highlights '+y)}`
  };

  const official = {
    'F1':'Formula 1', 'F2':'Formula 2', 'WEC':'FIA WEC',
    'Stock Car':'Stock Car BRB', 'Porsche Cup':'Porsche Cup Brasil', 'Fórmula E':'FIA Formula E'
  };

  function render(year) {
    let box = document.querySelector('.rush-season-media');
    if (!box) {
      box = document.createElement('section');
      box.className = 'rush-season-media rush-media';
      const main = document.querySelector('main');
      (main || document.body).prepend(box);
    }
    const url = sources[category]?.(year);
    if (!url) return;
    box.innerHTML = `
      <div class="rush-media-title"><h2>Melhores momentos · ${year}</h2><span>${category}</span></div>
      <div class="rush-media-grid">
        <article class="rush-media-card">
          <div class="rush-media-icon">★</div>
          <div class="rush-media-card-body">
            <strong>Melhores momentos oficiais — ${year}</strong>
            <p>Fonte oficial da ${official[category]}. O RushHub não hospeda nem copia os vídeos.</p>
            <a href="${url}" target="_blank" rel="noopener noreferrer">Abrir mídia oficial ↗</a>
          </div>
        </article>
      </div>`;
  }

  const params = new URLSearchParams(location.search);
  const year = params.get('ano');
  if (year && ['2026','2025','2024','2023','2012'].includes(year)) render(year);
})();
