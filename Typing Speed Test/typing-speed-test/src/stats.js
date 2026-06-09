const STORAGE_KEY = "typing_letter_stats_v1";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function update(letter, correct) {
  if (!letter) return;
  const l = letter.toLowerCase();
  const data = load();
  if (!data[l]) data[l] = { attempts: 0, correct: 0 };
  data[l].attempts += 1;
  if (correct) data[l].correct += 1;
  save(data);
}

function getBestAndWorst(minAttempts = 5) {
  const data = load();
  const entries = Object.entries(data).filter(([, v]) => v.attempts >= minAttempts);
  if (entries.length === 0) return { best: null, worst: null, data };
  const scored = entries.map(([k, v]) => ({ letter: k, rate: v.correct / v.attempts, attempts: v.attempts }));
  scored.sort((a, b) => b.rate - a.rate || b.attempts - a.attempts);
  const best = scored[0].letter;
  const worst = scored[scored.length - 1].letter;
  return { best, worst, data };
}

function getAllData() {
  return load();
}

function toCSV() {
  const data = load();
  const rows = [["letter","attempts","correct","rate"]];
  Object.keys(data).sort().forEach(k => {
    const v = data[k];
    const rate = v.attempts > 0 ? (v.correct / v.attempts) : 0;
    rows.push([k, String(v.attempts), String(v.correct), rate.toFixed(3)]);
  });
  return rows.map(r => r.join(",")).join("\n");
}

function resetAll() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export default { update, getBestAndWorst, getAllData, toCSV, resetAll };