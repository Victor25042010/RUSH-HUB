import json, urllib.request, datetime, pathlib

YEAR = 2026
URL = f"https://api.jolpi.ca/f1/alpha/schedules/{YEAR}/"
OUT = pathlib.Path("data/calendar.json")

def fetch():
    req=urllib.request.Request(URL,headers={"User-Agent":"RUSH-HUB/1.0"})
    with urllib.request.urlopen(req,timeout=30) as r:
        return json.load(r)

def main():
    payload=fetch()
    raw=payload.get("data",{}).get("races",[]) or payload.get("races",[]) or payload.get("meetings",[])
    races=[]
    for i,r in enumerate(raw,1):
        circuit=r.get("circuit",{}) or {}
        races.append({
            "round": r.get("round",i),
            "name": r.get("name") or r.get("meeting_name") or "Grand Prix",
            "circuit": circuit.get("circuitName") or r.get("circuit_short_name") or circuit.get("name") or "Circuito",
            "circuitId": circuit.get("circuitId") or r.get("circuit_short_name") or circuit.get("name") or "circuit",
            "country": r.get("country_name") or "",
            "date": r.get("date") or r.get("date_start"),
            "status": "CANCELLED" if r.get("is_cancelled") else "SCHEDULED"
        })
    result={"year":YEAR,"updatedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"source":"Jolpica F1","races":races}
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Atualizadas {len(races)} etapas.")

if __name__=="__main__":
    main()
