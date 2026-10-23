// Recopie les nouvelles ancres du journal d'audit SafeVote dans ce dépôt.
// Une ancre = position dans la chaîne d'audit + empreinte SHA-256 + heure.
// Chaque ancre devient un fichier immuable : anchors/AAAA/MM/JJ/<id>.json
// Variables d'environnement : SUPABASE_URL, SUPABASE_ANON_KEY (clé publique).
// Sortie : la liste des fichiers créés (un par ligne) sur la sortie standard.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL et SUPABASE_ANON_KEY sont requis.');
  process.exit(1);
}

const LATEST = 'latest.json';

async function readLatest() {
  try {
    return JSON.parse(await readFile(LATEST, 'utf8'));
  } catch {
    return { id: 0 };
  }
}

async function fetchAnchors(afterId) {
  const res = await fetch(`${url}/rest/v1/rpc/get_public_audit_anchors`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_after_id: afterId, p_limit: 1000 }),
  });
  if (!res.ok) {
    throw new Error(`Supabase a répondu ${res.status} : ${await res.text()}`);
  }
  return res.json();
}

const latest = await readLatest();
const anchors = await fetchAnchors(latest.id || 0);
const created = [];

for (const a of anchors) {
  const day = a.releve_le.slice(0, 10); // AAAA-MM-JJ, en UTC
  const [y, m, d] = day.split('-');
  const file = join('anchors', y, m, d, `${String(a.id).padStart(6, '0')}.json`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(a, null, 2)}\n`, { flag: 'wx' });
  created.push(file);
}

if (anchors.length > 0) {
  const last = anchors[anchors.length - 1];
  await writeFile(LATEST, `${JSON.stringify(last, null, 2)}\n`);
}

for (const f of created) console.log(f);
