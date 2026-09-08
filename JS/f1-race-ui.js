(() => {
  const races = {
    'f1-australia':['GP DA AUSTRÁLIA','Albert Park Circuit','🇦🇺 Austrália'],
    'f1-china':['GP DA CHINA','Shanghai International Circuit','🇨🇳 China'],
    'f1-japao':['GP DO JAPÃO','Suzuka International Racing Course','🇯🇵 Japão'],
    'f1-miami':['GP DE MIAMI','Miami International Autodrome','🇺🇸 EUA'],
    'f1-canada':['GP DO CANADÁ','Circuit Gilles-Villeneuve','🇨🇦 Canadá'],
    'f1-monaco':['GP DE MÔNACO','Circuit de Monaco','🇲🇨 Mônaco'],
    'f1-espanha':['GP DA ESPANHA','Circuit de Barcelona-Catalunya','🇪🇸 Espanha'],
    'f1-austria':['GP DA ÁUSTRIA','Red Bull Ring','🇦🇹 Áustria'],
    'f1-gra-bretanha':['GP DA GRÃ-BRETANHA','Silverstone Circuit','🇬🇧 Reino Unido'],
    'f1-belgica':['GP DA BÉLGICA','Circuit de Spa-Francorchamps','🇧🇪 Bélgica'],
    'f1-hungria':['GP DA HUNGRIA','Hungaroring','🇭🇺 Hungria'],
    'f1-holanda':['GP DA HOLANDA','Circuit Zandvoort','🇳🇱 Holanda'],
    'f1-italia':['GP DA ITÁLIA','Autodromo Nazionale Monza','🇮🇹 Itália'],
    'f1-madrid':['GP DA ESPANHA','Madring Circuit','🇪🇸 Espanha'],
    'f1-azerbaijao':['GP DO AZERBAIJÃO','Baku City Circuit','🇦🇿 Azerbaijão'],
    'f1-bahrein':['GP DO BAHREIN — EM MALÁSIA','Sepang International Circuit','🇲🇾 Malásia'],
    'f1-singapura':['GP DE SINGAPURA','Marina Bay Street Circuit','🇸🇬 Singapura'],
    'f1-eua':['GP DOS ESTADOS UNIDOS','Circuit of The Americas','🇺🇸 EUA'],
    'f1-mexico':['GP DA CIDADE DO MÉXICO','Autódromo Hermanos Rodríguez','🇲🇽 México'],
    'f1-sao-paulo':['GP DE SÃO PAULO','Autódromo José Carlos Pace','🇧🇷 Brasil'],
    'f1-las-vegas':['GP DE LAS VEGAS','Las Vegas Strip Circuit','🇺🇸 EUA'],
    'f1-catar':['GP DO CATAR','Lusail International Circuit','🇶🇦 Catar'],
    'f1-abu-dhabi':['GP DE ABU DHABI','Yas Marina Circuit','🇦🇪 Emirados Árabes Unidos']
  };
  const slug=location.pathname.split('/').pop().replace(/\.html$/i,'');
  const r=races[slug];if(!r)return;
  document.title=`RushHub — ${r[0]} 2026`;
  const eyebrow=document.querySelector('.hero .eyebrow'); if(eyebrow) eyebrow.textContent=`ETAPA · 2026 · ${r[2]}`;
  const h1=document.querySelector('.hero h1'); if(h1) h1.innerHTML=r[0].replace('GP ','GP <span>').replace(/<span>(.*)$/, '<span>$1</span>');
  const p=document.querySelector('.hero p'); if(p)p.textContent=`${r[1]} · Fórmula 1`;
  const circuit=document.querySelector('.panel-head small'); if(circuit)circuit.textContent=r[1].toUpperCase();
})();
