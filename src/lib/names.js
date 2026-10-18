import names from '@/data/names.json';

// "Encamisada · FMJ" — nome em português e, quando diferente, o nome do jogo em inglês.
export function ammoText(ammo) {
  const both = ammo.en && ammo.en !== ammo.pt ? `${ammo.pt} · ${ammo.en}` : ammo.pt;
  return ammo.standard ? `${both} (padrão)` : both;
}

// Nome em português de uma ferramenta ou consumível (o nome do jogo fica em inglês).
export function itemPt(name) {
  return names.items[name] || null;
}
