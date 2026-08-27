import { stringify } from "csv-stringify/sync";
import { writeFileSync } from "fs";

const COMPETITION_ID = 43; // FIFA World Cup
const SEASON_ID = 106; // 2022

const BASE = "https://raw.githubusercontent.com/statsbomb/open-data/master/data";

async function main() {
  // Fetch matches
  const matchesUrl = `${BASE}/matches/${COMPETITION_ID}/${SEASON_ID}.json`;
  const matchesRes = await fetch(matchesUrl);
  if (!matchesRes.ok) throw new Error(`Failed to fetch matches: ${matchesRes.status}`);
  const matches = await matchesRes.json();
  console.log(`Fetched ${matches.length} matches`);

  const rows = [];

  for (const match of matches) {
    const matchId = match.match_id;
    const eventsUrl = `${BASE}/events/${matchId}.json`;
    const eventsRes = await fetch(eventsUrl);
    if (!eventsRes.ok) {
      console.warn(`  Skipping match ${matchId}: HTTP ${eventsRes.status}`);
      continue;
    }
    const events = await eventsRes.json();

    for (const event of events) {
      if (event.type?.name !== "Shot") continue;

      const shot = event.shot;
      if (!shot) continue;

      const goal = shot.outcome?.name === "Goal";

      rows.push({
        match_id: String(matchId),
        minute: event.minute,
        team: event.team?.name ?? "",
        player: event.player?.name ?? "",
        location_x: event.location?.[0] ?? "",
        location_y: event.location?.[1] ?? "",
        shot_type: shot.type?.name ?? "",
        shot_body_part: shot.body_part?.name ?? "",
        xg: shot.statsbomb_xg ?? "",
        goal: goal,
        technique: shot.technique?.name ?? "",
      });
    }
  }

  console.log(`Extracted ${rows.length} shots`);

  const csv = stringify(rows, { header: true });
  const outPath = "statsbomb_shots.csv";
  writeFileSync(outPath, csv);
  console.log(`Wrote ${outPath} (${(csv.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});