import { TIERS, tierForBand } from './tiers';

// Um "layout" é { [tierId]: [weaponId, ...] } para uma categoria.

function emptyLayout() {
  return Object.fromEntries(TIERS.map((t) => [t.id, []]));
}

export function defaultLayout(category) {
  const layout = emptyLayout();
  for (const w of category.weapons) layout[tierForBand(w.band)].push(w.id);
  return layout;
}

// Aceita um layout salvo (possivelmente antigo ou incompleto) e devolve um
// layout válido: ids desconhecidos são descartados e armas que faltam voltam
// para o tier original.
export function reconcile(category, stored) {
  const fallback = defaultLayout(category);
  if (!stored || typeof stored !== 'object') return fallback;

  const valid = new Set(category.weapons.map((w) => w.id));
  const seen = new Set();
  const layout = emptyLayout();
  for (const t of TIERS) {
    const ids = Array.isArray(stored[t.id]) ? stored[t.id] : [];
    for (const id of ids) {
      if (!valid.has(id) || seen.has(id)) continue;
      seen.add(id);
      layout[t.id].push(id);
    }
  }
  for (const t of TIERS) {
    for (const id of fallback[t.id]) if (!seen.has(id)) layout[t.id].push(id);
  }
  return layout;
}

export function tierOf(layout, id) {
  const tier = TIERS.find((t) => layout[t.id].includes(id));
  return tier ? tier.id : null;
}

// Move a arma para `toTier`, antes de `beforeId` (ou no fim da faixa).
export function moveWeapon(layout, id, toTier, beforeId = null) {
  if (id === beforeId) return layout;
  const next = {};
  for (const t of TIERS) next[t.id] = layout[t.id].filter((x) => x !== id);
  const target = next[toTier];
  const index = beforeId ? target.indexOf(beforeId) : -1;
  if (index === -1) target.push(id);
  else target.splice(index, 0, id);
  return next;
}

// Troca a arma de lugar com a vizinha dentro da mesma faixa.
export function shiftWeapon(layout, id, delta) {
  const tier = tierOf(layout, id);
  if (!tier) return layout;
  const list = [...layout[tier]];
  const from = list.indexOf(id);
  const to = from + delta;
  if (to < 0 || to >= list.length) return layout;
  [list[from], list[to]] = [list[to], list[from]];
  return { ...layout, [tier]: list };
}

export function sameLayout(a, b) {
  return TIERS.every((t) => a[t.id].length === b[t.id].length && a[t.id].every((id, i) => id === b[t.id][i]));
}

// Ids das armas que estão num tier diferente do original.
export function changedIds(category, layout) {
  const changed = new Set();
  for (const w of category.weapons) {
    if (tierOf(layout, w.id) !== tierForBand(w.band)) changed.add(w.id);
  }
  return changed;
}
