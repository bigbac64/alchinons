import Slot from "../ui/dnd/Slot.jsx";
import Panel from "../ui/Panel.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";

const Inventory = ({ className, inventory, name = "Inventaire", ...other }) => {
  return (
    <Panel className={className} {...other}>
      <div className="border-b border-slate-700 px-4 py-3">
        <SectionHeader>{name}</SectionHeader>
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
    </Panel>
  );
};

export default Inventory;
