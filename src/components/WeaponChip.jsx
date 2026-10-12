'use client';

import traitIcons from '@/data/trait-icons.json';
import images from '@/data/weapon-images.json';

export const TRAIT_TYPE_LABEL = { burn: 'Burn', scarce: 'Scarce', evento: 'Evento' };

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

function Marker({ symbol, title }) {
  return (
    <span
      title={title}
      className="flex size-4 shrink-0 items-center justify-center rounded-full border border-brass/60 text-[10px] font-semibold text-brass"
    >
      {symbol}
      <span className="sr-only"> {title}</span>
    </span>
  );
}

export function TraitIcon({ name, className }) {
  const icon = traitIcons[name];
  if (icon) {
    return <img src={`/traits/${icon}`} alt="" width={64} height={64} draggable={false} className={className} />;
  }
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2);
  return (
    <span
      className={`flex items-center justify-center rounded-full border border-line bg-ink font-display text-lg text-muted ${className}`}
    >
      {initials}
    </span>
  );
}

function WeaponBody({ weapon }) {
  const image = images[weapon.name];
  return (
    <>
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
        {weapon.note ? <Marker symbol="?" title={weapon.note} /> : null}
      </span>
    </>
  );
}

function TraitBody({ trait }) {
  const cost = trait.cost ? `${trait.cost} ${trait.cost === 1 ? 'pt' : 'pts'}` : null;
  const tags = [cost, ...(trait.types || []).map((t) => TRAIT_TYPE_LABEL[t])];
  return (
    <>
      <TraitIcon name={trait.name} className="size-12" />
      <span className="flex items-center justify-center gap-1.5 text-xs leading-tight">
        <span>{trait.name}</span>
        {trait.adjusted ? <Marker symbol="*" title="Posição definida fora do guia" /> : null}
      </span>
      <span className="text-[11px] leading-none text-muted">{tags.filter(Boolean).join(' · ')}</span>
    </>
  );
}

export default function WeaponChip({
  weapon,
  kind,
  editing,
  selected,
  dimmed,
  dragging,
  dropBefore,
  originalTier,
  onSelect,
  onOpen,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) {
  // Editando, o clique seleciona para mover; fora da edição, abre os detalhes.
  const interactive = editing
    ? {
        draggable: true,
        'aria-pressed': selected,
        onClick: onSelect,
        onDragStart,
        onDragEnd,
        onDragOver,
        onDrop,
      }
    : { onClick: onOpen };

  return (
    <button
      type="button"
      {...interactive}
      className={[
        'relative flex flex-col items-center gap-1.5 rounded-md border px-2 pb-2 pt-2.5 text-center transition-[opacity,border-color,box-shadow]',
        selected ? 'border-brass bg-raised ring-1 ring-brass' : 'border-line bg-raised',
        selected ? '' : 'hover:border-brass/60',
        editing ? 'cursor-grab select-none active:cursor-grabbing' : '',
        dimmed ? 'opacity-25' : '',
        dragging ? 'opacity-40' : '',
        dropBefore ? 'shadow-[-4px_0_0_0_var(--color-brass)]' : '',
      ].join(' ')}
    >
      {kind === 'traits' ? <TraitBody trait={weapon} /> : <WeaponBody weapon={weapon} />}
      {originalTier ? (
        <span
          title={`Tier original: ${originalTier}`}
          className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-panel bg-brass"
        >
          <span className="sr-only">Tier original: {originalTier}</span>
        </span>
      ) : null}
    </button>
  );
}
