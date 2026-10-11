'use client';

import { useEffect, useRef } from 'react';
import images from '@/data/weapon-images.json';

export default function WeaponDetail({ weapon, tier, categoryLabel, source, onClose }) {
  const dialog = useRef(null);

  useEffect(() => {
    const el = dialog.current;
    if (weapon && !el.open) el.showModal();
    if (!weapon && el.open) el.close();
  }, [weapon]);

  const image = weapon ? images[weapon.name] : null;

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-lg border border-line bg-panel p-0 text-bone shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {weapon ? (
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span
              className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-md px-2 font-display text-2xl font-semibold text-ink"
              style={{ backgroundColor: tier.color }}
            >
              {tier.id}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide">
                {weapon.name}
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {categoryLabel}
                {weapon.slots ? ` · ${weapon.slots} ${weapon.slots === 1 ? 'slot' : 'slots'}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line text-muted hover:border-brass/60 hover:text-bone"
            >
              ✕
            </button>
          </div>

          {image ? (
            <img
              src={`/weapons/${image}`}
              alt=""
              width={512}
              height={128}
              className="mt-5 aspect-[4/1] w-full rounded-md bg-raised object-contain p-2 drop-shadow-[0_2px_3px_rgb(0_0_0/0.6)]"
            />
          ) : null}

          <p className="mt-5 text-[15px] leading-relaxed">
            {weapon.comment || 'O vídeo não comenta esta arma nesta categoria.'}
          </p>

          {weapon.note ? <p className="mt-3 text-sm text-brass">{weapon.note}.</p> : null}

          {source ? (
            <p className="mt-5 border-t border-line pt-3 text-xs text-muted">
              Resumo da opinião de {source.author} em{' '}
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-brass underline-offset-2 hover:underline"
              >
                {source.title}
              </a>
              .
            </p>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
