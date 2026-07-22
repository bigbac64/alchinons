import Slot from "../dnd/Slot.jsx";

const Inventory = ({ className, inventory, name = "Inventaire", ...other }) => {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-700 bg-[#161d2e] ${className}`} {...other}>
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{name}</h2>
      </div>
      {inventory?.items?.length ? (
        <ul className="divide-y divide-slate-700/60">
          {inventory.items.map((item) => (
            <Slot key={item.name} resource={item} layout="row" />
          ))}
        </ul>
      ) : (
        <p className="px-4 py-5 text-center text-sm italic text-slate-500">Inventaire vide.</p>
      )}
    </div>
  );
};

export default Inventory;
