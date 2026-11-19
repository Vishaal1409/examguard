"""Run the ExamGuard model over docs/mock_answers.csv and print ranked pairs.

Put this file in the SAME folder as score_pairs.py, model.onnx, etc.
Usage:  python run_mock_test.py /path/to/mock_answers.csv
"""
import csv
import sys
from itertools import combinations

from score_pairs import embed, score_pairs, CONFIG

csv_path = sys.argv[1] if len(sys.argv) > 1 else "mock_answers.csv"
MIN_WORDS = CONFIG["min_words"]
MEDIUM = CONFIG["threshold_medium"]
HIGH = CONFIG["threshold_high"]

with open(csv_path, encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))

kept, skipped = [], []
for r in rows:
    n_words = len(r["answer"].split())
    (kept if n_words >= MIN_WORDS else skipped).append((r, n_words))

print(f"Loaded {len(rows)} answers. Minimum words: {MIN_WORDS}")
print(f"\nSKIPPED (too short): {len(skipped)}")
for r, n in skipped:
    print(f"  id {r['id']} ({r['student']}) - {n} words")

texts = [r["answer"] for r, _ in kept]
E = embed(texts)
pairs = list(combinations(range(len(kept)), 2))
scores = score_pairs(E, pairs)


def label(s):
    return "HIGH" if s >= HIGH else "MEDIUM" if s >= MEDIUM else "LOW"


ranked = sorted(zip(scores, pairs), key=lambda x: -x[0])
print(f"\nRANKED PAIRS ({len(ranked)} total) - top 20")
print(f"{'score':>6}  {'level':<6}  pair")
for s, (i, j) in ranked[:20]:
    a, b = kept[i][0], kept[j][0]
    print(f"{s:6.3f}  {label(s):<6}  {a['id']:>2} ({a['student']}) vs {b['id']:>2} ({b['student']})")

print("\nPairs involving answer 1 (the original), best match first:")
for s, (i, j) in ranked:
    a, b = kept[i][0], kept[j][0]
    if "1" in (a["id"], b["id"]):
        print(f"{s:6.3f}  {label(s):<6}  {a['id']:>2} vs {b['id']:>2}")
