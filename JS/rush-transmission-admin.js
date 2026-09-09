(() => {
  const races=window.RUSH_RACES||{};
  const $=s=>document.querySelector(s);
  const date=$('#tr-date'), cat=$('#tr-cat'), raceSel=$('#tr-race'), name=$('#tr-name'), url=$('#tr-url'), type=$('#tr-type'), driver=$('#tr-driver'), out=$('#tr-output');
  function localDate(iso){return new Date(iso).toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});}
  function find(){
    const d=date.value; const c=cat.value; raceSel.innerHTML='';
    Object.entries(races).filter(([k,r])=>localDate(r.start)===d && (!c||r.category===c)).forEach(([k,r])=>{const o=document.createElement('option');o.value=k;o.textContent=r.name;raceSel.appendChild(o)});
    if(!raceSel.options.length){const o=document.createElement('option');o.textContent='Nenhuma corrida encontrada nessa data';raceSel.appendChild(o)}
  }
  function load(){try{const all=JSON.parse(localStorage.getItem('RUSHHUB_TRANSMISSIONS')||'{}');const x=all[raceSel.value];if(x){name.value=x.name||'';url.value=x.url||'';type.value=x.type||'external';driver.value=x.driverOfDay||''}}catch{}}
  $('#tr-form').addEventListener('submit',e=>{e.preventDefault();const slug=raceSel.value;if(!races[slug])return alert('Selecione uma corrida.');let all={};try{all=JSON.parse(localStorage.getItem('RUSHHUB_TRANSMISSIONS')||'{}')}catch{}all[slug]={name:name.value.trim(),url:url.value.trim(),type:type.value,driverOfDay:driver.value.trim()};localStorage.setItem('RUSHHUB_TRANSMISSIONS',JSON.stringify(all,null,2));out.textContent='Salvo para '+races[slug].name+'. Agora essa corrida usará essa transmissão neste navegador.';});
  $('#tr-export').onclick=()=>{const data=localStorage.getItem('RUSHHUB_TRANSMISSIONS')||'{}';const js='window.RUSHHUB_TRANSMISSIONS = '+data+';';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([js],{type:'text/javascript'}));a.download='rush-transmissoes-config.js';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
  $('#tr-clear').onclick=()=>{if(confirm('Apagar as transmissões personalizadas deste navegador?')){localStorage.removeItem('RUSHHUB_TRANSMISSIONS');load();out.textContent='Configuração local limpa.'}};
  date.addEventListener('change',find);cat.addEventListener('change',find);raceSel.addEventListener('change',load);find();
})();
