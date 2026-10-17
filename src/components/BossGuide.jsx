'use client';

import bossImages from '@/data/boss-images.json';

const TYPE_LABEL = { boss: 'Boss', wild: 'Alvo selvagem' };

function Badge({ children, accent }) {
  return (
    <span
      className={[
        'rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        accent ? 'bg-brass text-ink' : 'bg-ink/80 text-bone',
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function DamageList({ title, items, tone }) {
  return (
    <section>
      <h3 className={`font-display text-sm uppercase tracking-wider ${tone === 'good' ? 'text-good' : 'text-blood'}`}>
        {title}
      </h3>
      <ul className="mt-2 divide-y divide-line/70">
        {items.map((item) => (
          <li key={item.label} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span>{item.label}</span>
            <span
              className={`shrink-0 text-right text-xs font-semibold tabular-nums ${tone === 'good' ? 'text-good' : 'text-blood'}`}
            >
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BossCard({ boss }) {
  const image = bossImages[boss.id];
  return (
    <article id={`boss-${boss.id}`} className="scroll-mt-32 overflow-hidden rounded-lg border border-line bg-panel">
      <div className="relative aspect-[16/7] bg-raised">
        {image ? (
          <img
            src={`/bosses/${image}`}
            alt=""
            width={800}
            height={450}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:px-5">
          <div className="flex flex-wrap gap-1.5">
            <Badge>{TYPE_LABEL[boss.type]}</Badge>
            {boss.isNew ? <Badge accent>Novo no 2.9</Badge> : null}
          </div>
          <h2 className="mt-1.5 font-display text-3xl font-semibold uppercase tracking-wide drop-shadow">
            {boss.name}
          </h2>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-muted">{boss.summary}</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <DamageList title="Fraquezas" items={boss.weaknesses} tone="good" />
          <DamageList title="Resistências" items={boss.resistances} tone="bad" />
        </div>

        <section className="mt-6">
          <h3 className="font-display text-sm uppercase tracking-wider text-brass">Jeito mais fácil</h3>
          <ol className="mt-2 space-y-2">
            {boss.easiest.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brass/15 text-[11px] font-semibold text-brass">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <dl className="mt-5 grid gap-2 rounded-md border border-line bg-raised/60 p-3 text-sm">
          <div className="flex gap-2">
            <dt className="w-12 shrink-0 font-semibold text-good">Leve</dt>
            <dd>{boss.bring}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-12 shrink-0 font-semibold text-blood">Evite</dt>
            <dd>{boss.avoid}</dd>
          </div>
        </dl>

        {boss.extra ? <p className="mt-3 text-sm leading-relaxed text-brass">{boss.extra}</p> : null}
      </div>
    </article>
  );
}

export default function BossGuide({ guide }) {
  return (
    <div className="mt-5">
      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        Fraquezas, resistências e o jeito mais fácil de derrotar cada boss no patch 2.9. Os números são multiplicadores
        de dano em relação a um acerto normal: ×2 é o dobro do dano, ×0,5 é metade.
      </p>

      <nav aria-label="Bosses" className="mt-4 flex flex-wrap gap-2">
        {guide.bosses.map((boss) => (
          <a
            key={boss.id}
            href={`#boss-${boss.id}`}
            className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm text-muted hover:border-brass/60 hover:text-bone"
          >
            {boss.name}
          </a>
        ))}
      </nav>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {guide.bosses.map((boss) => (
          <BossCard key={boss.id} boss={boss} />
        ))}
      </div>

      <footer className="mt-8 text-xs leading-relaxed text-muted">
        Fontes:{' '}
        {guide.sources.map((source, i) => (
          <span key={source.url}>
            {i > 0 ? ' · ' : ''}
            <a href={source.url} target="_blank" rel="noreferrer" className="text-brass underline-offset-2 hover:underline">
              {source.label}
            </a>
          </span>
        ))}
        . Os multiplicadores vêm dos dados do jogo compilados pela Fextralife; as estratégias foram resumidas em
        português. Hunt: Showdown e suas imagens pertencem à Crytek.
      </footer>
    </div>
  );
}
