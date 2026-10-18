'use client';

import { useMemo, useState } from 'react';
import data from '@/data/damage.json';
import { hitsToKill, killBands, shotDamage } from '@/lib/damage';

const HEALTH = [150, 125, 100, 75, 50];
const MAX_DISTANCE = 200;
const HIT_COLOR = { 1: 'var(--color-good)', 2: 'var(--color-brass)', 3: '#d9823b', 4: 'var(--color-blood)' };
const hitColor = (hits) => HIT_COLOR[Math.min(hits, 4)] || 'var(--color-blood)';
const plural = (n) => (n === 1 ? 'tiro' : 'tiros');

const byType = data.weapons.reduce((acc, w) => {
  (acc[w.type] = acc[w.type] || []).push(w);
  return acc;
}, {});
const TYPE_ORDER = ['Rifle', 'Espingarda', 'Pistola', 'Arco e besta', 'Outros'];

function describeBands(bands) {
  return bands
    .map((b) => {
      const what = b.hits === Infinity ? 'não mata' : `${b.hits} ${plural(b.hits)}`;
      if (b.to === null) return b.from === 0 ? `${what} a qualquer distância` : `${what} a partir de ${b.from} m`;
      return `${what} até ${b.to} m`;
    })
    .join(' · ');
}

function BandBar({ bands, distance }) {
  return (
    <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-ink">
      {bands.map((b) => {
        const to = b.to === null ? MAX_DISTANCE : b.to + 1;
        return (
          <span
            key={b.from}
            className="absolute inset-y-0"
            style={{
              left: `${(b.from / MAX_DISTANCE) * 100}%`,
              width: `${((to - b.from) / MAX_DISTANCE) * 100}%`,
              backgroundColor: b.hits === Infinity ? 'var(--color-line)' : hitColor(b.hits),
              opacity: 0.85,
            }}
          />
        );
      })}
      <span
        className="absolute inset-y-[-2px] w-0.5 bg-bone shadow-[0_0_0_1px_var(--color-ink)]"
        style={{ left: `${(distance / MAX_DISTANCE) * 100}%` }}
      />
    </div>
  );
}

export default function DamageCalculator({ preset }) {
  const initial = data.weapons.find((w) => w.slug === preset?.slug) || data.weapons.find((w) => w.slug === 'mosin-nagant');
  const [slug, setSlug] = useState(initial.slug);
  const [ammoRef, setAmmoRef] = useState(() => {
    for (let b = 0; b < initial.barrels.length; b++) {
      const a = initial.barrels[b].ammo.findIndex((x) => x.key === preset?.ammo);
      if (a >= 0) return `${b}:${a}`;
    }
    return '0:0';
  });
  const [health, setHealth] = useState(150);
  const [distance, setDistance] = useState(30);
  const [hundredHands, setHundredHands] = useState(false);

  const weapon = data.weapons.find((w) => w.slug === slug);
  const [barrelIndex, ammoIndex] = ammoRef.split(':').map(Number);
  const barrel = weapon.barrels[barrelIndex] || weapon.barrels[0];
  const ammo = barrel.ammo[ammoIndex] || barrel.ammo[0];
  const bonus = weapon.bow && hundredHands ? 1.1 : 1;
  const isShotgun = (ammo.pellets || 1) > 1;

  const zones = useMemo(
    () =>
      data.zones.map((zone) => {
        if (!zone.mult) return { ...zone, head: true };
        const damage = shotDamage(ammo, zone.mult, distance, bonus);
        return {
          ...zone,
          damage,
          hits: hitsToKill(damage, health),
          bands: killBands(ammo, zone.mult, health, MAX_DISTANCE, bonus),
        };
      }),
    [ammo, distance, health, bonus],
  );

  function pickWeapon(nextSlug) {
    setSlug(nextSlug);
    setAmmoRef('0:0');
    setHundredHands(false);
  }

  const upper = zones.find((z) => z.id === 'upper');

  return (
    <div className="mt-5">
      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        Escolha a arma, a munição, a distância e a vida do alvo. A calculadora mostra quantos acertos cada parte do
        corpo precisa para derrubar o caçador, usando o dano e a curva de queda de dano dos arquivos do jogo.
      </p>

      <div className="mt-5 grid gap-4 rounded-lg border border-line bg-panel p-4 sm:grid-cols-2 sm:p-5">
        <label className="block text-sm">
          <span className="font-display text-xs uppercase tracking-wider text-brass">Arma</span>
          <select
            value={slug}
            onChange={(e) => pickWeapon(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-line bg-raised px-2 text-bone focus:border-brass focus:outline-none"
          >
            {TYPE_ORDER.filter((t) => byType[t]).map((type) => (
              <optgroup key={type} label={type}>
                {byType[type].map((w) => (
                  <option key={w.slug} value={w.slug}>
                    {w.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-display text-xs uppercase tracking-wider text-brass">Munição</span>
          <select
            value={`${weapon.barrels.indexOf(barrel)}:${barrel.ammo.indexOf(ammo)}`}
            onChange={(e) => setAmmoRef(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-line bg-raised px-2 text-bone focus:border-brass focus:outline-none"
          >
            {weapon.barrels.map((b, bi) => {
              const options = b.ammo.map((a, ai) => (
                <option key={a.key} value={`${bi}:${ai}`}>
                  {a.name}
                  {a.price ? ` ($${a.price})` : ''}
                  {a.scarce ? ' · rara' : ''}
                </option>
              ));
              return b.label ? (
                <optgroup key={b.label} label={b.label}>
                  {options}
                </optgroup>
              ) : (
                options
              );
            })}
          </select>
        </label>

        <div className="text-sm">
          <span className="font-display text-xs uppercase tracking-wider text-brass">Distância</span>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={MAX_DISTANCE}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              aria-label="Distância em metros"
              className="h-2 flex-1 accent-[var(--color-brass)]"
            />
            <span className="w-16 text-right font-display text-xl tabular-nums">{distance} m</span>
          </div>
        </div>

        <div className="text-sm">
          <span className="font-display text-xs uppercase tracking-wider text-brass">Vida do alvo</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HEALTH.map((hp) => (
              <button
                key={hp}
                type="button"
                aria-pressed={hp === health}
                onClick={() => setHealth(hp)}
                className={[
                  'rounded-md border px-2.5 py-1 text-sm tabular-nums transition-colors',
                  hp === health ? 'border-brass bg-brass text-ink' : 'border-line bg-raised text-muted hover:text-bone',
                ].join(' ')}
              >
                {hp}
              </button>
            ))}
          </div>
        </div>

        {weapon.bow ? (
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={hundredHands}
              onChange={(e) => setHundredHands(e.target.checked)}
              className="size-4 accent-[var(--color-brass)]"
            />
            Com o trait Hundred Hands (+10% de dano no puxão completo)
          </label>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[18rem_1fr]">
        <aside className="rounded-lg border border-line bg-panel p-4">
          {weapon.image ? (
            <img
              src={`/weapons/${weapon.image}`}
              alt=""
              width={512}
              height={128}
              className="aspect-[4/1] w-full object-contain drop-shadow-[0_2px_3px_rgb(0_0_0/0.6)]"
            />
          ) : null}
          <h2 className="mt-2 font-display text-2xl font-semibold uppercase tracking-wide">{weapon.name}</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-muted">Preço</dt>
            <dd className="text-right tabular-nums">
              ${weapon.price}
              {ammo.price ? <span className="text-muted"> + ${ammo.price}</span> : null}
            </dd>
            <dt className="text-muted">Slots</dt>
            <dd className="text-right tabular-nums">{weapon.slots}</dd>
            <dt className="text-muted">Dano no tronco</dt>
            <dd className="text-right tabular-nums">{Math.floor(shotDamage(ammo, 1.3, 0, bonus))}</dd>
            {ammo.velocity ? (
              <>
                <dt className="text-muted">Velocidade</dt>
                <dd className="text-right tabular-nums">{ammo.velocity} m/s</dd>
              </>
            ) : null}
            <dt className="text-muted">Dano começa a cair</dt>
            <dd className="text-right tabular-nums">{ammo.curve[0][0]} m</dd>
            {weapon.dropRange ? (
              <>
                <dt className="text-muted">Bala sem cair até</dt>
                <dd className="text-right tabular-nums">{weapon.dropRange} m</dd>
              </>
            ) : null}
          </dl>
          {upper.bands[0].hits === 1 ? (
            <p className="mt-3 rounded-md bg-good/10 px-3 py-2 text-sm text-good">
              Mata com 1 tiro no tronco até {upper.bands[0].to ?? MAX_DISTANCE} m (alvo com {health} de vida).
            </p>
          ) : null}
        </aside>

        <section className="rounded-lg border border-line bg-panel p-4 sm:p-5">
          <h3 className="font-display text-sm uppercase tracking-wider text-brass">
            A {distance} m, contra {health} de vida
          </h3>
          <ul className="mt-3 divide-y divide-line">
            {zones.map((zone) => (
              <li key={zone.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{zone.label}</span>
                  {zone.head ? (
                    <span className="font-display text-xl" style={{ color: hitColor(1) }}>
                      1 tiro <span className="text-xs font-sans text-muted">sempre mata</span>
                    </span>
                  ) : (
                    <span className="flex items-baseline gap-3">
                      <span className="text-xs tabular-nums text-muted">{Math.floor(zone.damage)} de dano</span>
                      <span className="font-display text-xl tabular-nums" style={{ color: hitColor(zone.hits) }}>
                        {zone.hits === Infinity ? 'não mata' : `${zone.hits} ${plural(zone.hits)}`}
                      </span>
                    </span>
                  )}
                </div>
                {zone.head ? null : (
                  <>
                    <BandBar bands={zone.bands} distance={distance} />
                    <p className="mt-1.5 text-xs text-muted">{describeBands(zone.bands)}</p>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted">
            <span>0 m</span>
            <span>{MAX_DISTANCE / 2} m</span>
            <span>{MAX_DISTANCE} m</span>
          </div>
        </section>
      </div>

      <ul className="mt-4 space-y-1 text-xs leading-relaxed text-muted">
        <li>
          Considera acerto direto, sem atravessar parede ou objeto
          {isShotgun ? ', e todos os chumbos acertando o alvo (de longe, parte deles erra)' : ''}. Não conta dano extra de
          sangramento, fogo ou veneno.
        </li>
        <li>
          Multiplicadores por parte do corpo (patch 2.4): tronco superior ×1,3, barriga ×1,2, braço ×0,9, perna ×0,8.
          Tiro na cabeça mata sempre.
        </li>
        <li>
          Dados de dano e queda por distância:{' '}
          <a href={data.source.url} target="_blank" rel="noreferrer" className="text-brass underline-offset-2 hover:underline">
            {data.source.label}
          </a>
          .
        </li>
      </ul>
    </div>
  );
}
