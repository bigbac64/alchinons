import React from 'react';
import { useMap } from '../../providers/map/MapProvider.jsx';

const MapLegend = () => {
  const { terrain } = useMap();

  return (
    <div className="rounded-xl border border-slate-700 bg-[#161d2e] p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Légende</h2>
      <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
        {terrain && Object.entries(terrain).map(([id, t]) => (
          <li key={id} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-sm border border-black/30"
              style={{ backgroundColor: t.color }}
            />
            {t.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MapLegend;
