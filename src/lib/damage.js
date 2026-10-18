// Dano contra caçadores: dano base × multiplicador da parte do corpo × queda por distância.
// A curva é uma lista de [distância, fração do dano]: cheia até o primeiro ponto,
// linear entre os pontos e constante depois do último (regras do patch 2.4).

export function falloffAt(curve, distance) {
  if (!curve?.length || distance <= curve[0][0]) return curve?.[0]?.[1] ?? 1;
  for (let i = 1; i < curve.length; i++) {
    const [d0, f0] = curve[i - 1];
    const [d1, f1] = curve[i];
    if (distance <= d1) return f0 + ((f1 - f0) * (distance - d0)) / (d1 - d0);
  }
  return curve[curve.length - 1][1];
}

// Dano de um disparo (todos os chumbos no alvo, no caso de espingarda).
export function shotDamage(ammo, mult, distance, bonus = 1) {
  return ammo.damage * (ammo.pellets || 1) * mult * bonus * falloffAt(ammo.curve, distance);
}

export function hitsToKill(damage, health) {
  if (damage <= 0) return Infinity;
  return Math.ceil(health / damage - 1e-9);
}

// Faixas de distância com o mesmo número de acertos: [{ hits, from, to }], com to = null na última.
export function killBands(ammo, mult, health, maxDistance, bonus = 1) {
  const bands = [];
  for (let d = 0; d <= maxDistance; d++) {
    const hits = hitsToKill(shotDamage(ammo, mult, d, bonus), health);
    const last = bands[bands.length - 1];
    if (last && last.hits === hits) last.to = d;
    else bands.push({ hits, from: d, to: d });
  }
  bands[bands.length - 1].to = null;
  return bands;
}
