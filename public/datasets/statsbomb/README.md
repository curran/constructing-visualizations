# StatsBomb Open Data

**Football (soccer) event data from StatsBomb's open-data repository.**

Shot-level event data from the FIFA World Cup 2022 (competition_id=43, season_id=106),
including shot locations, expected goals (xG), body part, technique, and outcome.
Data is sourced from StatsBomb's public GitHub repository.

---

## Dataset File

| File | Size | Rows |
|---|---|---|
| `statsbomb_shots.csv` | 130 KB | 1,494 shots × 11 columns |

---

## Schema (11 columns — Shots)

| # | Column | Type | Description | Sample Value |
|---|---|---|---|---|
| 1 | `match_id` | string | Match unique ID | `3857277` |
| 2 | `minute` | number | Minute of event | `23` |
| 3 | `team` | string | Team name | `Argentina` |
| 4 | `player` | string | Player name | `Lionel Messi` |
| 5 | `location_x` | number | X coordinate on pitch (0-120) | `85.3` |
| 6 | `location_y` | number | Y coordinate on pitch (0-80) | `42.1` |
| 7 | `shot_type` | string | Open play, Free kick, Penalty, etc. | `Open Play` |
| 8 | `shot_body_part` | string | Right foot, Left foot, Head | `Left foot` |
| 9 | `xg` | number | Expected goals value (0-1) | `0.45` |
| 10 | `goal` | boolean | Whether goal was scored (`1`=yes, ``=no) | `1` |
| 11 | `technique` | string | Volley, Half volley, Normal | `Volley` |

---

## Methodology

### Source
```
https://github.com/statsbomb/open-data
```

### Processing Steps

1. **Fetch** competition list from StatsBomb's GitHub:
   `https://raw.githubusercontent.com/statsbomb/open-data/master/data/competitions.json`
2. **Choose** a single competition + season (e.g., FIFA World Cup 2022).
3. **Fetch** matches: `https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/{comp_id}/{season_id}.json`
4. **For each match**, fetch events:
   `https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/{match_id}.json`
5. **Extract** shots and passes into flattened format.

### Actual Statistics

| Metric | Value |
|---|---|
| Competition | FIFA World Cup 2022 |
| Match count | 64 |
| Total shots | 1,494 |
| Goals | 195 (13.1%) |
| Shot types | Open Play (1,382), Penalty (64), Free Kick (46), Corner (2) |
| Body parts | Right Foot (780), Left Foot (449), Head (252), Other (13) |
| Techniques | Normal (1,151), Half Volley (212), Volley (92), Diving Header (14), Lob (13), Overhead Kick (7), Backheel (5) |

---

For passes, an alternative schema is available:

| Column | Type | Description |
|---|---|---|
| `match_id` | string | Match unique ID |
| `minute` | number | Minute of event |
| `team` | string | Team name |
| `player` | string | Player name |
| `pass_type` | string | Cross, Through ball, Long ball, etc. |
| `pass_length` | number | Pass length (meters) |
| `pass_angle` | number | Pass angle (degrees) |
| `pass_end_x` | number | Destination X coordinate |
| `pass_end_y` | number | Destination Y coordinate |
| `pass_outcome` | string | Complete, Incomplete, Offside, etc. |

### Prerequisites

- Node.js ≥ 18

### Actual Runtime

~20 seconds (JSON downloads + flattening) for 64 matches and 338K+ events.

### Prerequisites

---

## Usage Ideas

- **Shot map**: pitch visualization with shot locations colored by xG
- **Player comparison**: shot distribution and accuracy by player
- **Team analysis**: shot volume by zone and outcome
- **Goal probability**: histogram of xG values split by goal/no goal

---

## License

Data provided by StatsBomb under the StatsBomb Open Data license. Free for
research and educational use.