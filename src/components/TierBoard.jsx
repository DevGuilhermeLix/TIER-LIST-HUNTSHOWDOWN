'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { changedIds, moveWeapon, sameLayout, shiftWeapon, tierOf } from '@/lib/layout';
import { TIERS, TIER_BY_ID, tierForBand } from '@/lib/tiers';
import { useTierLayouts } from '@/lib/useTierLayouts';
import AmmoGuide from './AmmoGuide';
import BossGuide from './BossGuide';
import DamageCalculator from './DamageCalculator';
import LoadoutGuide from './LoadoutGuide';
import MoveBar from './MoveBar';
import TierRow from './TierRow';
import WeaponChip from './WeaponChip';
import WeaponDetail from './WeaponDetail';

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const toolButton =
  'rounded-md border border-line bg-raised px-3 py-1.5 text-sm text-bone hover:border-brass/60 disabled:opacity-40 disabled:hover:border-line';

export default function TierBoard({ data }) {
  const allCategories = useMemo(() => data.views.flatMap((v) => v.categories), [data]);
  const { layouts, defaults, updateCategory, resetCategory, resetAll, importLayouts } =
    useTierLayouts(allCategories);

  const [viewId, setViewId] = useState(data.views[0].id);
  // Os guias (loadouts, bosses) não são tier lists: ao abrir um, a última lista fica guardada em viewId.
  const [guideId, setGuideId] = useState(null);
  const guide = data.guides.find((g) => g.id === guideId) || null;
  // Arma e munição pré-selecionadas quando o guia de munições abre a calculadora.
  const [calcPreset, setCalcPreset] = useState(null);
  const [categoryByView, setCategoryByView] = useState(() =>
    Object.fromEntries(data.views.map((v) => [v.id, v.categories[0].id])),
  );
  const [groupByCategory, setGroupByCategory] = useState({});
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const fileInput = useRef(null);

  const view = data.views.find((v) => v.id === viewId);
  const category = view.categories.find((c) => c.id === categoryByView[viewId]);
  const layout = layouts[category.id];
  const weaponsById = useMemo(
    () => Object.fromEntries(category.weapons.map((w) => [w.id, w])),
    [category],
  );

  const isTraits = view.kind === 'traits';
  const noun = isTraits ? { one: 'trait', other: 'traits' } : { one: 'arma', other: 'armas' };

  // Categorias com grupos (traits) trocam as abas de categoria por um filtro de grupo.
  const groups = view.categories.length === 1 ? category.groups || null : null;
  const groupId = groups ? groupByCategory[category.id] || null : null;
  const group = groupId ? groups.find((g) => g.id === groupId) : null;
  const inGroup = (weapon) => !groupId || weapon.group === groupId;
  const shown = category.weapons.filter(inGroup);
  // "63 traits", mas "46 armas em Rifles" ou "14 traits em Burn e Scarce".
  const scope = groups && !group ? '' : ` em ${group ? group.label : category.label}`;

  const needle = normalize(query.trim());
  const matches = (weapon) => !needle || normalize(weapon.name).includes(needle);
  const matchCount = shown.filter(matches).length;

  const changed = useMemo(() => changedIds(category, layout), [category, layout]);
  const totalChanged = useMemo(
    () => allCategories.reduce((sum, c) => sum + changedIds(c, layouts[c.id]).size, 0),
    [allCategories, layouts],
  );
  const categoryDirty = !sameLayout(layout, defaults[category.id]);
  const anyDirty = allCategories.some((c) => !sameLayout(layouts[c.id], defaults[c.id]));

  // Fora do modo de edição, esconde os tiers vazios antes do primeiro e depois do último em uso.
  const bands = category.weapons.map((w) => w.band - 1);
  const used = TIERS.map((t, i) => (layout[t.id].length ? i : -1)).filter((i) => i >= 0);
  const firstTier = Math.min(...bands, ...used);
  const lastTier = Math.max(...bands, ...used);
  const visibleTiers = editing ? TIERS : TIERS.slice(firstTier, lastTier + 1);

  const selected = selectedId ? weaponsById[selectedId] : null;
  const selectedTier = selected ? tierOf(layout, selected.id) : null;
  const selectedIndex = selected ? layout[selectedTier].indexOf(selected.id) : -1;
  const opened = openId ? weaponsById[openId] : null;

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => e.key === 'Escape' && setSelectedId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  function switchView(id) {
    setViewId(id);
    setGuideId(null);
    setSelectedId(null);
  }

  function openGuide(id) {
    setGuideId(id);
    setEditing(false);
    setSelectedId(null);
  }

  function switchCategory(id) {
    setCategoryByView((prev) => ({ ...prev, [viewId]: id }));
    setSelectedId(null);
  }

  function switchGroup(id) {
    setGroupByCategory((prev) => ({ ...prev, [category.id]: id }));
    setSelectedId(null);
  }

  function toggleEditing() {
    setEditing((on) => !on);
    setSelectedId(null);
    setNotice('');
  }

  function endDrag() {
    setDragId(null);
    setDropTarget(null);
  }

  function markDropTarget(e, tier, beforeId) {
    if (!dragId) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dropTarget?.tier !== tier || dropTarget?.beforeId !== beforeId) setDropTarget({ tier, beforeId });
  }

  function drop(e, tier, beforeId) {
    if (!dragId) return;
    e.preventDefault();
    e.stopPropagation();
    updateCategory(category.id, (current) => moveWeapon(current, dragId, tier, beforeId));
    endDrag();
  }

  function exportLayouts() {
    const payload = { app: 'hunt-tier-list', version: 1, exportedAt: new Date().toISOString(), layouts };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hunt-tier-list.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed?.layouts || typeof parsed.layouts !== 'object') throw new Error('sem layouts');
      if (anyDirty && !window.confirm('Substituir os tiers atuais pelos do arquivo?')) return;
      importLayouts(parsed.layouts);
      setSelectedId(null);
      setNotice(`Tiers importados de ${file.name}.`);
    } catch {
      setNotice('Não deu para ler esse arquivo. Use um JSON exportado por este site.');
    }
  }

  return (
    <div className={`mx-auto max-w-6xl px-4 pt-8 sm:pt-12 ${selected ? 'pb-48' : 'pb-16'}`}>
      <header>
        <p className="font-display text-xs uppercase tracking-[0.3em] text-brass">Hunt: Showdown 1896</p>
        <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide sm:text-5xl">
          {guide ? guide.heading : `Tier list de ${noun.other}`}
        </h1>
      </header>

      <div className="sticky top-0 z-20 -mx-4 mt-6 border-b border-line bg-ink/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap rounded-md border border-line bg-panel p-0.5">
            {data.views.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={!guide && v.id === viewId}
                onClick={() => switchView(v.id)}
                className={[
                  'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                  !guide && v.id === viewId ? 'bg-brass text-ink' : 'text-muted hover:text-bone',
                ].join(' ')}
              >
                {v.label}
              </button>
            ))}
            {data.guides.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={g.id === guideId}
                onClick={() => openGuide(g.id)}
                className={[
                  'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                  g.id === guideId ? 'bg-brass text-ink' : 'text-muted hover:text-bone',
                ].join(' ')}
              >
                {g.label}
              </button>
            ))}
          </div>

          {guide ? null : (
            <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar ${noun.one}…`}
            aria-label={`Buscar ${noun.one}`}
            className="order-last h-9 w-full rounded-md border border-line bg-panel px-3 text-sm text-bone placeholder:text-muted focus:border-brass focus:outline-none sm:order-none sm:w-auto sm:max-w-xs sm:flex-1"
          />

          <button
            type="button"
            aria-pressed={editing}
            onClick={toggleEditing}
            className={[
              'ml-auto rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              editing ? 'border-brass bg-brass text-ink' : 'border-brass/60 text-brass hover:bg-brass/10',
            ].join(' ')}
          >
            {editing ? 'Concluir edição' : 'Editar tiers'}
          </button>
            </>
          )}
        </div>

        {guide ? null : (
        <div className="mt-3 flex gap-1 overflow-x-auto [scrollbar-width:none] sm:flex-wrap" role="tablist" aria-label={view.label}>
          {(groups
            ? [{ id: null, label: 'Todos' }, ...groups].map((g) => ({
                key: g.id || 'todos',
                label: g.label,
                active: g.id === groupId,
                items: g.id ? category.weapons.filter((w) => w.group === g.id) : category.weapons,
                onSelect: () => switchGroup(g.id),
              }))
            : view.categories.map((c) => ({
                key: c.id,
                label: c.label,
                active: c.id === category.id,
                items: c.weapons,
                onSelect: () => switchCategory(c.id),
              }))
          ).map((tab) => {
            const total = tab.items.length;
            const found = needle ? tab.items.filter(matches).length : total;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={tab.active}
                onClick={tab.onSelect}
                className={[
                  'flex shrink-0 items-baseline gap-2 border-b-2 px-3 py-2 font-display text-base uppercase tracking-wide transition-colors',
                  tab.active ? 'border-brass text-bone' : 'border-transparent text-muted hover:text-bone',
                  needle && found === 0 ? 'opacity-40' : '',
                ].join(' ')}
              >
                {tab.label}
                <span className="font-sans text-xs font-medium normal-case tracking-normal tabular-nums text-muted">
                  {needle ? `${found}/${total}` : total}
                </span>
              </button>
            );
          })}
        </div>
        )}
      </div>

      {guide?.kind === 'damage' ? (
        <DamageCalculator key={JSON.stringify(calcPreset)} preset={calcPreset} />
      ) : guide?.kind === 'ammo' ? (
        <AmmoGuide
          onOpenCalculator={(slug, ammo) => {
            setCalcPreset({ slug, ammo });
            openGuide('damage');
            window.scrollTo({ top: 0 });
          }}
        />
      ) : guide?.kind === 'bosses' ? (
        <BossGuide guide={guide} />
      ) : guide?.kind === 'loadouts' ? (
        <LoadoutGuide guide={guide} />
      ) : (
        <>
      {editing ? (
        <div className="mt-4 rounded-lg border border-brass/40 bg-brass/5 p-3 sm:p-4">
          <p className="text-sm text-bone">
            Arraste um card para outra faixa, ou clique nele e escolha o tier. As mudanças ficam salvas neste
            navegador.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={toolButton}
              disabled={!categoryDirty}
              onClick={() => {
                resetCategory(category.id);
                setSelectedId(null);
              }}
            >
              Restaurar {category.label}
            </button>
            <button
              type="button"
              className={toolButton}
              disabled={!anyDirty}
              onClick={() => {
                if (!window.confirm('Voltar todas as listas para os tiers originais?')) return;
                resetAll();
                setSelectedId(null);
              }}
            >
              Restaurar tudo
            </button>
            <button type="button" className={toolButton} onClick={exportLayouts}>
              Exportar JSON
            </button>
            <button type="button" className={toolButton} onClick={() => fileInput.current?.click()}>
              Importar JSON
            </button>
            <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importFile} />
          </div>
          {notice ? (
            <p className="mt-3 text-sm text-brass" role="status">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-sm text-muted">
        {needle
          ? `${matchCount} de ${shown.length} ${noun.other}${scope} batem com a busca`
          : `${shown.length} ${noun.other}${scope}`}
        {editing ? '' : ' · clique num card para ver o comentário'}
        {totalChanged > 0 ? ` · ${totalChanged} fora do tier original` : ''}
      </p>

      <div className="mt-3 flex flex-col gap-2" onDragEnd={endDrag}>
        {visibleTiers.map((tier) => {
          const ids = layout[tier.id].filter((id) => inGroup(weaponsById[id]));
          return (
            <TierRow
              key={tier.id}
              tier={tier}
              count={ids.length}
              compact={isTraits}
              editing={editing}
              dropActive={dropTarget?.tier === tier.id}
              onDragOver={(e) => markDropTarget(e, tier.id, null)}
              onDrop={(e) => drop(e, tier.id, null)}
            >
              {ids.map((id) => {
                const weapon = weaponsById[id];
                return (
                  <WeaponChip
                    key={id}
                    weapon={weapon}
                    kind={view.kind}
                    editing={editing}
                    selected={id === selectedId}
                    dimmed={!matches(weapon)}
                    dragging={id === dragId}
                    dropBefore={dropTarget?.beforeId === id && dragId !== id}
                    originalTier={changed.has(id) ? tierForBand(weapon.band) : null}
                    onSelect={() => setSelectedId((current) => (current === id ? null : id))}
                    onOpen={() => setOpenId(id)}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', weapon.name);
                      setDragId(id);
                      setSelectedId(null);
                    }}
                    onDragEnd={endDrag}
                    onDragOver={(e) => markDropTarget(e, tier.id, id)}
                    onDrop={(e) => drop(e, tier.id, id)}
                  />
                );
              })}
            </TierRow>
          );
        })}
      </div>

      <footer className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
        {view.id === 'classe' ? (
          <span className="flex items-center gap-2">
            <span className="flex gap-0.5">
              <span className="size-1.5 rounded-[1px] bg-muted/70" />
              <span className="size-1.5 rounded-[1px] bg-muted/70" />
              <span className="size-1.5 rounded-[1px] bg-muted/70" />
            </span>
            slots que a arma ocupa
          </span>
        ) : null}
        {isTraits ? (
          <>
            <span>pts = custo em pontos de upgrade</span>
            <span className="flex items-center gap-2">
              <span className="flex size-4 items-center justify-center rounded-full border border-brass/60 text-[10px] font-semibold text-brass">
                *
              </span>
              posição definida fora do guia
            </span>
          </>
        ) : (
          <span className="flex items-center gap-2">
            <span className="flex size-4 items-center justify-center rounded-full border border-brass/60 text-[10px] font-semibold text-brass">
              ?
            </span>
            nome a conferir
          </span>
        )}
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brass" />
          tier alterado por você
        </span>
        <span className="basis-full">{view.credit} Hunt: Showdown e suas imagens pertencem à Crytek.</span>
      </footer>
        </>
      )}

      <WeaponDetail
        weapon={opened}
        kind={view.kind}
        tier={opened ? TIER_BY_ID[tierOf(layout, opened.id)] : null}
        contextLabel={opened && groups ? groups.find((g) => g.id === opened.group)?.label : category.label}
        source={view.source}
        onClose={() => setOpenId(null)}
      />

      {editing && selected ? (
        <MoveBar
          weapon={selected}
          currentTier={selectedTier}
          canShiftLeft={selectedIndex > 0}
          canShiftRight={selectedIndex < layout[selectedTier].length - 1}
          onMove={(tierId) => updateCategory(category.id, (current) => moveWeapon(current, selected.id, tierId))}
          onShift={(delta) => updateCategory(category.id, (current) => shiftWeapon(current, selected.id, delta))}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}
