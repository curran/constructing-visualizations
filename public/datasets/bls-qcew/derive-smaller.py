import csv
import os
import sys

INPUT = os.path.join(os.path.dirname(__file__), "bls_qcew_county.csv")

DERIVED = [
    {
        "file": "bls_qcew_county_all_industries.csv",
        "desc": "'All Industries' (code=00) for all years",
        "filter": lambda r: r["industry_code"] == "00",
    },
    {
        "file": "bls_qcew_county_all_industries_2024.csv",
        "desc": "'All Industries' (code=00) for 2024 only",
        "filter": lambda r: r["industry_code"] == "00" and r["year"] == "2024",
    },
    {
        "file": "bls_qcew_county_manufacturing.csv",
        "desc": "Manufacturing (code=31-33) for all years",
        "filter": lambda r: r["industry_code"] == "31-33",
    },
    {
        "file": "bls_qcew_county_2024.csv",
        "desc": "All industry codes for 2024 only",
        "filter": lambda r: r["year"] == "2024",
    },
]

def main():
    print("Reading source CSV...")
    rows = []
    with open(INPUT, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Normalise whitespace in industry_name
            row["industry_name"] = " ".join(row["industry_name"].split())
            rows.append(row)
    print(f"  Read {len(rows)} rows\n")

    base_dir = os.path.dirname(__file__)

    for spec in DERIVED:
        filtered = [r for r in rows if spec["filter"](r)]
        out_path = os.path.join(base_dir, spec["file"])
        with open(out_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=filtered[0].keys())
            writer.writeheader()
            writer.writerows(filtered)
        size_kb = os.path.getsize(out_path) / 1024
        print(
            f"  ✅ {spec['file']}  "
            f"({len(filtered):,} rows, {size_kb:.0f} KB)  "
            f"{spec['desc']}"
        )

    print("\nAll 4 derived files created.")


if __name__ == "__main__":
    main()