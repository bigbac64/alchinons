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
        <li className={"col-span-full"}>
          <span className="flex items-center gap-1.5">
            <svg viewBox="-50 -50 100 100" className="w-4 h-4 shrink-0">
              <defs>
                <pattern
                  id="legendHatchPattern"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="24"
                    x2="24"
                    y2="0"
                    stroke="#000000"
                    strokeWidth="2"
                    opacity="0.95"
                  />
                </pattern>
              </defs>

              <polygon
                points="46,0 23,40 -23,40 -46,0 -23,-40 23,-40"
                fill="#888888"
                stroke="#555"
                strokeWidth="3"
              />

              <polygon
                points="46,0 23,40 -23,40 -46,0 -23,-40 23,-40"
                fill="url(#legendHatchPattern)"
              />
            </svg>
            Terrain vidé de ressource
          </span>

        </li>
      </ul>
    </Panel>
  );
};

export default MapLegend;
