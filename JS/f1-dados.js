/* RUSHHUB — dados visuais e classificação F1 2026 */
window.RUSH_F1 = {
  teams: {
    'Mercedes': '#00D2BE',
    'Ferrari': '#E8002D',
    'McLaren': '#FF8000',
    'Red Bull Racing': '#3671C6',
    'Racing Bulls': '#6692FF',
    'Alpine': '#FF87BC',
    'Haas F1 Team': '#B6BABD',
    'Audi': '#F50537',
    'Williams': '#64C4FF',
    'Aston Martin': '#229971',
    'Cadillac': '#D0D0D0'
  },
  drivers: [
    {pos:1, name:'Kimi Antonelli', short:'ANT', number:12, team:'Mercedes', points:267},
    {pos:2, name:'George Russell', short:'RUS', number:63, team:'Mercedes', points:201},
    {pos:3, name:'Lewis Hamilton', short:'HAM', number:44, team:'Ferrari', points:191},
    {pos:4, name:'Lando Norris', short:'NOR', number:1, team:'McLaren', points:171},
    {pos:5, name:'Charles Leclerc', short:'LEC', number:16, team:'Ferrari', points:155},
    {pos:6, name:'Max Verstappen', short:'VER', number:3, team:'Red Bull Racing', points:127},
    {pos:7, name:'Oscar Piastri', short:'PIA', number:81, team:'McLaren', points:116},
    {pos:8, name:'Isack Hadjar', short:'HAD', number:6, team:'Red Bull Racing', points:71},
    {pos:9, name:'Liam Lawson', short:'LAW', number:30, team:'Racing Bulls', points:51},
    {pos:10, name:'Pierre Gasly', short:'GAS', number:10, team:'Alpine', points:41},
    {pos:11, name:'Arvid Lindblad', short:'LIN', number:41, team:'Racing Bulls', points:29},
    {pos:12, name:'Franco Colapinto', short:'COL', number:43, team:'Alpine', points:21},
    {pos:13, name:'Oliver Bearman', short:'BEA', number:87, team:'Haas F1 Team', points:18},
    {pos:14, name:'Gabriel Bortoleto', short:'BOR', number:5, team:'Audi', points:10},
    {pos:15, name:'Nico Hulkenberg', short:'HUL', number:27, team:'Audi', points:6},
    {pos:16, name:'Carlos Sainz', short:'SAI', number:55, team:'Williams', points:6},
    {pos:17, name:'Alexander Albon', short:'ALB', number:23, team:'Williams', points:5},
    {pos:18, name:'Esteban Ocon', short:'OCO', number:31, team:'Haas F1 Team', points:3},
    {pos:19, name:'Fernando Alonso', short:'ALO', number:14, team:'Aston Martin', points:3},
    {pos:20, name:'Yuki Tsunoda', short:'TSU', number:22, team:'Racing Bulls', points:1},
    {pos:21, name:'Lance Stroll', short:'STR', number:18, team:'Aston Martin', points:0},
    {pos:22, name:'Valtteri Bottas', short:'BOT', number:77, team:'Cadillac', points:0},
    {pos:23, name:'Sergio Perez', short:'PER', number:11, team:'Cadillac', points:0}
  ],
  color(team) { return this.teams[team] || '#888'; },
  driverByName(name) { return this.drivers.find(d => d.name.toLowerCase() === String(name || '').toLowerCase()); }
};
