import React from 'react';
import { useMap } from '../../providers/map/MapProvider.jsx';
import Panel from '../ui/Panel.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';

const MapLegend = () => {
  const { terrain } = useMap();

  return (
    <Panel className="p-4">
      <SectionHeader className="mb-3">Légende</SectionHeader>
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
    </Panel>
  );
};

export default MapLegend;
