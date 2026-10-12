import TierBoard from '@/components/TierBoard';
import traits from '@/data/traits.json';
import weapons from '@/data/weapons.json';

const WIKI = 'Hunt: Showdown 1896 Wiki (huntshowdown.wiki.gg)';

const data = {
  views: [
    ...weapons.views.map((view) => ({
      ...view,
      kind: 'weapons',
      source: weapons.source,
      credit: `Ordem e comentários: tier list de ${weapons.source.author} para o patch 2.9, resumida em português. Ícones das armas: ${WIKI}.`,
    })),
    {
      ...traits,
      // O quadro trata todo item como "weapon"; os traits só mudam de aparência.
      categories: traits.categories.map(({ items, ...category }) => ({ ...category, weapons: items })),
      credit: `Tiers e comentários: guia de traits de ${traits.source.author} (maio de 2026), resumido em português e atualizado com as mudanças dos patches 2.8 e 2.9. Custos e ícones: ${WIKI}.`,
    },
  ],
};

export default function Home() {
  return <TierBoard data={data} />;
}
