const JOLPICA = "https://api.jolpi.ca/f1/alpha";
const OPENF1 = "https://api.openf1.org/v1";

async function getJSON(url, options = {}) {
  const res = await fetch(url, { headers: { Accept: "application/json" }, ...options });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function loadCalendar(year = new Date().getFullYear()) {
  try {
    const data = await getJSON(`../data/calendar.json?${Date.now()}`);
    if (data.year === Number(year) && Array.isArray(data.races) && data.races.length) return data;
  } catch {}
  const remote = await getJSON(`${JOLPICA}/schedules/${year}/`);
  return normalizeSchedule(remote, year);
}

function normalizeSchedule(payload, year) {
  const raw = payload?.data?.races || payload?.races || payload?.meetings || [];
  return { year, updatedAt: new Date().toISOString(), races: raw.map((r, i) => ({
    round: r.round ?? i + 1,
    name: r.name ?? r.meeting_name ?? "Grand Prix",
    circuit: r.circuit?.circuitName ?? r.circuit_short_name ?? r.circuit?.name ?? "Circuito",
    circuitId: r.circuit?.circuitId ?? slug(r.circuit_short_name ?? r.circuit?.name ?? "circuit"),
    country: r.Circuit?.Location?.country ?? r.country_name ?? "",
    date: r.date ?? r.date_start ?? null,
    status: r.is_cancelled ? "CANCELLED" : "SCHEDULED"
  })) };
}

export async function loadRace(round, year = new Date().getFullYear()) {
  const data = await loadCalendar(year);
  return data.races.find(r => String(r.round) === String(round));
}

export async function loadOpenF1Championship(sessionKey = "latest") {
  const [drivers, teams] = await Promise.all([
    getJSON(`${OPENF1}/championship_drivers?session_key=${sessionKey}`),
    getJSON(`${OPENF1}/championship_teams?session_key=${sessionKey}`)
  ]);
  return { drivers, teams };
}

function slug(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

export { OPENF1, JOLPICA };