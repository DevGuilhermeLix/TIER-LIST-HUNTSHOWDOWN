'use client';

import { TIERS } from '@/lib/tiers';

const iconButton =
  'flex size-9 items-center justify-center rounded-md border border-line bg-raised text-bone hover:border-brass/60 disabled:opacity-30';

export default function MoveBar({ weapon, currentTier, canShiftLeft, canShiftRight, onMove, onShift, onClose }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 shadow-[0_-12px_32px_rgb(0_0_0/0.5)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <p className="min-w-0 text-sm text-muted">
          Mover <strong className="font-semibold text-bone">{weapon.name}</strong> para
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TIERS.map((t) => {
            const current = t.id === currentTier;
            return (
              <button
                key={t.id}
                type="button"
                aria-current={current || undefined}
                aria-label={`Mover para o tier ${t.id}`}
                onClick={() => onMove(t.id)}
                style={{ backgroundColor: t.color }}
                className={[
                  'h-9 min-w-9 rounded-md px-2 font-display text-base font-semibold text-ink transition-transform hover:-translate-y-0.5',
                  current ? 'ring-2 ring-bone ring-offset-2 ring-offset-panel' : '',
                ].join(' ')}
              >
                {t.id}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button
            type="button"
            className={iconButton}
            disabled={!canShiftLeft}
            onClick={() => onShift(-1)}
            aria-label="Mover para a esquerda na faixa"
            title="Mover para a esquerda na faixa"
          >
            ←
          </button>
          <button
            type="button"
            className={iconButton}
            disabled={!canShiftRight}
            onClick={() => onShift(1)}
            aria-label="Mover para a direita na faixa"
            title="Mover para a direita na faixa"
          >
            →
          </button>
          <button type="button" className={iconButton} onClick={onClose} aria-label="Fechar" title="Fechar (Esc)">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
