// Ordem dos tiers, do melhor para o pior. A faixa 1 da planilha vira o
// primeiro tier, a faixa 2 o segundo, e assim por diante.
export const TIERS = [
  { id: 'S+', color: '#d9483c' },
  { id: 'S', color: '#e07b36' },
  { id: 'A', color: '#e0a93b' },
  { id: 'B', color: '#d3c54a' },
  { id: 'C', color: '#a0bf4b' },
  { id: 'D', color: '#62ae60' },
  { id: 'E', color: '#47a596' },
  { id: 'F', color: '#4b90c1' },
  { id: 'G', color: '#6377cb' },
  { id: 'H', color: '#8766c6' },
  { id: 'I', color: '#a95eaf' },
  { id: 'J', color: '#8c8377' },
];

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t]));

export function tierForBand(band) {
  return TIERS[Math.min(band, TIERS.length) - 1].id;
}
