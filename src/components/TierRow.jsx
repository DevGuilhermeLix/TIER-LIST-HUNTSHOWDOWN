'use client';

export default function TierRow({ tier, count, editing, dropActive, onDragOver, onDrop, children }) {
  const empty = count === 0;
  return (
    <section
      aria-label={`Tier ${tier.id}`}
      onDragOver={editing ? onDragOver : undefined}
      onDrop={editing ? onDrop : undefined}
      className={[
        'grid grid-cols-[3.25rem_1fr] overflow-hidden rounded-lg border bg-panel transition-colors sm:grid-cols-[5rem_1fr]',
        dropActive ? 'border-brass' : 'border-line',
        empty && !editing ? 'opacity-50' : '',
      ].join(' ')}
    >
      <div
        className="flex flex-col items-center justify-center px-1 py-3 text-ink"
        style={{ backgroundColor: tier.color }}
      >
        <span className="font-display text-2xl font-semibold leading-none sm:text-4xl">{tier.id}</span>
        <span className="mt-1.5 text-[11px] font-semibold tabular-nums opacity-70">{count}</span>
      </div>
      <div className="grid min-h-16 grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] content-center gap-2 p-2.5 sm:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] sm:p-3">
        {empty ? (
          <span className="col-span-full px-1 text-sm text-muted">{editing ? 'Solte uma arma aqui' : 'Nenhuma arma'}</span>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
