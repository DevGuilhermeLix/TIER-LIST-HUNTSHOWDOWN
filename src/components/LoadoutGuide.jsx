'use client';

import { useState } from 'react';
import images from '@/data/weapon-images.json';
import { TraitIcon } from './WeaponChip';

const FILTERS = [
  { id: null, label: 'Todos' },
  { id: 'meta', label: 'Mais usados' },
  { id: 'divertido', label: 'Divertidos' },
];

function Suggested({ item, children, className = '' }) {
  return (
    <span
      title={item.suggested ? 'Sugestão: o criador não mostrou este item' : undefined}
      className={`${className} ${item.suggested ? 'text-muted' : ''}`}
    >
      {children}
      {item.suggested ? <span className="ml-0.5 text-brass">*</span> : null}
    </span>
  );
}

function SectionTitle({ children }) {
  return <h3 className="font-display text-xs uppercase tracking-wider text-brass">{children}</h3>;
}

function WeaponBox({ weapon }) {
  const image = images[weapon.name];
  return (
    <div
      className={`rounded-md border bg-raised/60 p-3 ${weapon.suggested ? 'border-dashed border-line' : 'border-line'}`}
    >
      {image ? (
        <img
          src={`/weapons/${image}`}
          alt=""
          width={512}
          height={128}
          loading="lazy"
          className="aspect-[4/1] w-full object-contain drop-shadow-[0_2px_3px_rgb(0_0_0/0.6)]"
        />
      ) : null}
      <p className="mt-2 text-sm font-semibold">
        <Suggested item={weapon}>
          {weapon.count ? `${weapon.count}× ` : ''}
          {weapon.name}
        </Suggested>
        <span className="ml-2 text-xs font-normal text-muted">
          {weapon.slots} {weapon.slots === 1 ? 'slot' : 'slots'}
        </span>
      </p>
      {weapon.ammo.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {weapon.ammo.map((ammo) => (
            <span
              key={ammo.name}
              title={ammo.scarce ? 'Munição rara: não dá para comprar, só achar no mapa' : undefined}
              className="rounded border border-line bg-ink/60 px-1.5 py-0.5 text-[11px] text-bone"
            >
              {ammo.name}
              {ammo.scarce ? <span className="text-muted"> · rara</span> : null}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-muted">Corpo a corpo, sem munição</p>
      )}
      {weapon.note ? <p className="mt-2 text-[11px] leading-snug text-muted">{weapon.note}</p> : null}
    </div>
  );
}

function ItemList({ title, items }) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="mt-1.5 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.name}>
            <Suggested item={item}>
              {item.name}
              {item.count ? <span className="text-muted"> ×{item.count}</span> : null}
            </Suggested>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LoadoutCard({ loadout }) {
  const needsQuartermaster = loadout.traits.some((t) => t.name === 'Quartermaster');
  return (
    <article id={`loadout-${loadout.id}`} className="flex flex-col rounded-lg border border-line bg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={[
            'rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
            loadout.category === 'meta' ? 'bg-brass text-ink' : 'bg-good/20 text-good',
          ].join(' ')}
        >
          {loadout.category === 'meta' ? 'Mais usado' : 'Divertido'}
        </span>
        {loadout.tags.map((tag) => (
          <span key={tag} className="rounded bg-raised px-2 py-0.5 text-[11px] text-muted">
            {tag}
          </span>
        ))}
      </div>
      <h2 className="mt-2 font-display text-2xl font-semibold uppercase leading-tight tracking-wide">{loadout.name}</h2>
      <p className="mt-1 text-xs text-muted">
        de {loadout.source.creator} ·{' '}
        <a
          href={loadout.source.url}
          target="_blank"
          rel="noreferrer"
          className="text-brass underline-offset-2 hover:underline"
        >
          {loadout.source.title}
        </a>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {loadout.weapons.map((weapon) => (
          <WeaponBox key={weapon.name} weapon={weapon} />
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{loadout.summary}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ItemList title="Ferramentas" items={loadout.tools} />
        <ItemList title="Consumíveis" items={loadout.consumables} />
      </div>

      <section className="mt-4">
        <SectionTitle>Traits</SectionTitle>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {loadout.traits.map((trait) => (
            <span
              key={trait.name}
              className={[
                'flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-xs',
                trait.suggested ? 'border-dashed border-line' : 'border-brass/50',
              ].join(' ')}
            >
              <TraitIcon name={trait.name} className="size-6" />
              <Suggested item={trait}>{trait.name}</Suggested>
            </span>
          ))}
        </div>
      </section>

      <div className="grow" />
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-sm">
        <span>
          <strong className="font-display text-lg text-bone">${loadout.cost}</strong>{' '}
          <span className="text-muted">no total</span>
        </span>
        <span className="text-muted">{loadout.points} pontos de trait</span>
        <span className="text-muted">{loadout.slots} slots de arma</span>
        {needsQuartermaster ? (
          <span className="rounded bg-blood/15 px-2 py-0.5 text-xs text-blood">Precisa de Quartermaster</span>
        ) : null}
      </div>
    </article>
  );
}

export default function LoadoutGuide({ guide }) {
  const [filter, setFilter] = useState(null);
  const shown = guide.loadouts.filter((l) => !filter || l.category === filter);

  return (
    <div className="mt-5">
      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        Loadouts completos tirados de vídeos recentes (patches 2.8 e 2.9) de criadores grandes: armas, munição de cada
        uma, ferramentas, consumíveis e traits. O que o criador não mostrou ficou marcado com{' '}
        <span className="text-brass">*</span>: é sugestão minha. Preços e slots conferidos na wiki; o custo inclui
        armas, munições especiais, ferramentas e consumíveis.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Tipo de loadout">
        {FILTERS.map((f) => {
          const count = guide.loadouts.filter((l) => !f.id || l.category === f.id).length;
          const active = f.id === filter;
          return (
            <button
              key={f.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={[
                'rounded-md border px-3 py-1.5 text-sm transition-colors',
                active ? 'border-brass bg-brass/10 text-bone' : 'border-line bg-panel text-muted hover:text-bone',
              ].join(' ')}
            >
              {f.label} <span className="tabular-nums text-muted">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {shown.map((loadout) => (
          <LoadoutCard key={loadout.id} loadout={loadout} />
        ))}
      </div>

      <footer className="mt-8 text-xs leading-relaxed text-muted">
        Fontes: vídeos de Whityyy, REXNOR, NOAURA, RachtaZ, Psychoghost Gaming e EMAIZA (link em cada card), lidos pelas
        legendas. Preços, slots e munições: Hunt: Showdown 1896 Wiki (huntshowdown.wiki.gg). Hunt: Showdown e suas
        imagens pertencem à Crytek.
      </footer>
    </div>
  );
}
