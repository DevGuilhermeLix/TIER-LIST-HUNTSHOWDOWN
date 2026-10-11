'use client';

import images from '@/data/weapon-images.json';

function SlotPips({ slots }) {
  return (
    <span className="flex shrink-0 gap-0.5" title={`${slots} ${slots === 1 ? 'slot' : 'slots'}`}>
      {Array.from({ length: slots }, (_, i) => (
        <span key={i} className="size-1.5 rounded-[1px] bg-muted/70" />
      ))}
      <span className="sr-only">
        {slots} {slots === 1 ? 'slot' : 'slots'}
      </span>
    </span>
  );
}

export default function WeaponChip({
  weapon,
  editing,
  selected,
  dimmed,
  dragging,
  dropBefore,
  originalTier,
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) {
  const image = images[weapon.name];
  const Tag = editing ? 'button' : 'div';
  const interactive = editing
    ? {
        type: 'button',
        draggable: true,
        'aria-pressed': selected,
        onClick: onSelect,
        onDragStart,
        onDragEnd,
        onDragOver,
        onDrop,
      }
    : {};

  return (
    <Tag
      {...interactive}
      className={[
        'relative flex flex-col items-center gap-1.5 rounded-md border px-2 pb-2 pt-2.5 text-center transition-[opacity,border-color,box-shadow]',
        selected ? 'border-brass bg-raised ring-1 ring-brass' : 'border-line bg-raised',
        editing && !selected ? 'hover:border-brass/60' : '',
        editing ? 'cursor-grab select-none active:cursor-grabbing' : '',
        dimmed ? 'opacity-25' : '',
        dragging ? 'opacity-40' : '',
        dropBefore ? 'shadow-[-4px_0_0_0_var(--color-brass)]' : '',
      ].join(' ')}
    >
      {image ? (
        <img
          src={`/weapons/${image}`}
          alt=""
          width={512}
          height={128}
          loading="lazy"
          draggable={false}
          className="aspect-[4/1] w-full object-contain drop-shadow-[0_2px_3px_rgb(0_0_0/0.6)]"
        />
      ) : (
        <span className="flex aspect-[4/1] w-full items-center justify-center rounded border border-dashed border-line text-[10px] uppercase tracking-wider text-muted">
          sem imagem
        </span>
      )}
      <span className="flex min-h-8 flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs leading-tight">
        <span>{weapon.name}</span>
        {weapon.slots ? <SlotPips slots={weapon.slots} /> : null}
        {weapon.note ? (
          <span
            title={weapon.note}
            className="flex size-4 shrink-0 items-center justify-center rounded-full border border-brass/60 text-[10px] font-semibold text-brass"
          >
            ?<span className="sr-only"> {weapon.note}</span>
          </span>
        ) : null}
      </span>
      {originalTier ? (
        <span
          title={`Tier original: ${originalTier}`}
          className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-panel bg-brass"
        >
          <span className="sr-only">Tier original: {originalTier}</span>
        </span>
      ) : null}
    </Tag>
  );
}
