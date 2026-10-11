'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultLayout, reconcile } from './layout';

const STORAGE_KEY = 'hunt-tier-list:v1';

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Guarda o layout de todas as categorias e persiste no navegador.
export function useTierLayouts(categories) {
  const defaults = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, defaultLayout(c)])),
    [categories],
  );
  const [layouts, setLayouts] = useState(defaults);
  const [loaded, setLoaded] = useState(false);

  const fromStored = useCallback(
    (stored) => Object.fromEntries(categories.map((c) => [c.id, reconcile(c, stored?.[c.id])])),
    [categories],
  );

  // O servidor renderiza o layout original; o salvo entra depois de montar.
  useEffect(() => {
    const stored = readStored();
    if (stored) setLayouts(fromStored(stored));
    setLoaded(true);
  }, [fromStored]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch {
      // armazenamento indisponível: as mudanças valem só para esta sessão
    }
  }, [layouts, loaded]);

  const updateCategory = useCallback((categoryId, updater) => {
    setLayouts((prev) => {
      const next = updater(prev[categoryId]);
      return next === prev[categoryId] ? prev : { ...prev, [categoryId]: next };
    });
  }, []);

  const resetCategory = useCallback(
    (categoryId) => setLayouts((prev) => ({ ...prev, [categoryId]: defaults[categoryId] })),
    [defaults],
  );

  const resetAll = useCallback(() => setLayouts(defaults), [defaults]);

  const importLayouts = useCallback((stored) => setLayouts(fromStored(stored)), [fromStored]);

  return { layouts, defaults, updateCategory, resetCategory, resetAll, importLayouts };
}
