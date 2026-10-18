'use client';

import { useState } from 'react';
import data from '@/data/ammo.json';

const GROUP_ORDER = ['Balas', 'Espingarda', 'Bestas e arco', 'Bomb Lance e Bomb Launcher', 'Nitro Express'];
const VISIBLE_WEAPONS = 10;
const groupId = (label) => 'ammo-group-' + label.toLowerCase().normalize('NFD').replace(/[^a-z]+/g, '-');

const signed = (n) => (n > 0 ? `+${n}` : String(n).replace('-', '−'));
const range = ([a, b], unit = '') => (a === b ? `${signed(a)}${unit}` : `${signed(a)} a ${signed(b)}${unit}`);

function StatChips({ ammo }) {
  const chips = [];
  if (ammo.velocity) chips.push(['Velocidade', range(ammo.velocity, ' m/s')]);
  if (ammo.damage && !['Slug', 'Penny Shot', 'Flechette', 'Dragon Breath', 'Starshell'].includes(ammo.key)) {
    chips.push(['Dano', range(ammo.damage)]);
  }
  if (ammo.dropRange) chips.push(['Bala sem cair', range(ammo.dropRange, ' m')]);
  if (!chips.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {chips.map(([label, value]) => (
        <span key={label} className="rounded border border-line bg-ink/60 px-2 py-0.5 text-[11px]">
          <span className="text-muted">{label}</span> <span className="tabular-nums">{value}</span>
        </span>
      ))}
    </div>
  );
}

function AmmoCard({ ammo, onOpenCalculator }) {
  const [showAll, setShowAll] = useState(false);
  const weapons = showAll ? ammo.users : ammo.users.slice(0, VISIBLE_WEAPONS);
  const price = ammo.price ? (ammo.price[0] === ammo.price[1] ? `$${ammo.price[0]}` : `$${ammo.price[0]}–${ammo.price[1]}`) : null;

  return (
    <article id={`ammo-${ammo.id}`} className="scroll-mt-32 rounded-lg border border-line bg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-2xl font-semibold uppercase tracking-wide">{ammo.pt}</h3>
          {ammo.en !== ammo.pt ? <p className="text-sm text-muted">no jogo: {ammo.en}</p> : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ammo.scarce ? (
            <span className="rounded bg-blood/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blood">
              Rara · só no mapa
            </span>
          ) : null}
          {price ? (
            <span className="rounded bg-raised px-2 py-0.5 text-[11px] tabular-nums text-muted">{price}</span>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed">{ammo.what}</p>
      <StatChips ammo={ammo} />
      <p className="mt-3 text-sm leading-relaxed text-muted">
        <span className="font-semibold text-good">Quando usar: </span>
        {ammo.when}
      </p>

      <div className="mt-4">
        <p className="text-xs text-muted">
          Disponível em {ammo.users.length} {ammo.users.length === 1 ? 'arma' : 'armas'}
          {ammo.users.some((u) => u.slug) ? ' · clique para ver na calculadora' : ''}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {weapons.map((w) =>
            w.slug ? (
              <button
                key={w.name}
                type="button"
                onClick={() => onOpenCalculator(w.slug, ammo.key)}
                className="rounded-full border border-line bg-raised px-2.5 py-0.5 text-xs hover:border-brass/60 hover:text-bone"
              >
                {w.name}
              </button>
            ) : (
              <span key={w.name} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                {w.name}
              </span>
            ),
          )}
          {ammo.users.length > VISIBLE_WEAPONS ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="rounded-full px-2.5 py-0.5 text-xs text-brass hover:underline"
            >
              {showAll ? 'mostrar menos' : `+ ${ammo.users.length - VISIBLE_WEAPONS} armas`}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function AmmoGuide({ onOpenCalculator }) {
  const groups = GROUP_ORDER.map((g) => ({ label: g, ammo: data.ammo.filter((a) => a.group === g) })).filter(
    (g) => g.ammo.length,
  );

  return (
    <div className="mt-5">
      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        O que cada munição especial faz, quanto custa, em quais armas entra e quando vale a pena. Os números mostram o
        que muda em relação à munição padrão da arma (varia de arma para arma). Munições raras não podem ser compradas
        desde o patch 2.8: só aparecem no mapa.
      </p>

      <nav aria-label="Grupos de munição" className="mt-4 flex flex-wrap gap-2">
        {groups.map((g) => (
          <a
            key={g.label}
            href={`#${groupId(g.label)}`}
            className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm text-muted hover:border-brass/60 hover:text-bone"
          >
            {g.label} <span className="tabular-nums">{g.ammo.length}</span>
          </a>
        ))}
      </nav>

      {groups.map((g) => (
        <section key={g.label} id={groupId(g.label)} className="mt-8 scroll-mt-32">
          <h2 className="font-display text-xl uppercase tracking-wider text-brass">{g.label}</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {g.ammo.map((ammo) => (
              <AmmoCard key={ammo.id} ammo={ammo} onOpenCalculator={onOpenCalculator} />
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-8 text-xs leading-relaxed text-muted">
        Fontes: descrições e regras da Hunt: Showdown 1896 Wiki (huntshowdown.wiki.gg), números por arma do The Bayou
        Index (bayouindex.com) e dicas de uso de REXNOR, Whityyy, NOAURA e RachtaZ. Hunt: Showdown pertence à Crytek.
      </footer>
    </div>
  );
}
