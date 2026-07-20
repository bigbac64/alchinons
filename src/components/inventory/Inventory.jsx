import React from 'react';

const Inventory = (props) => {
  const {className, inventory, name="Inventaire", ...other} = props;

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-700 bg-[#161d2e] ${className}`} {...other}>
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{name}</h2>
      </div>
         {inventory?.items?.length ? (
           <ul className="divide-y divide-slate-700/60">
             {inventory.items.map(({ name, quantity }) => (
               <li
                 key={name}
                 className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-slate-700/20"
               >
                 <span className="text-slate-200">{name}</span>
                 <span className="rounded-md bg-slate-700 px-2.5 py-0.5 font-mono text-sm text-emerald-300">
                      {quantity}
                    </span>
               </li>
             ))}
           </ul>
         ) : (
           <p className="px-4 py-5 text-center text-sm italic text-slate-500">Inventaire vide.</p>
         )}
    </div>
  );
}

export default Inventory;