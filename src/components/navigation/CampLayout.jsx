import { Link, Outlet } from "react-router-dom";
import {usePlayer} from "../../providers/map/PlayerProvider.jsx";

function CampLayout() {
  const { currentTile } = usePlayer();

  const isCamp = currentTile?.id === "camp";

  return isCamp && (
    <div className="min-h-full bg-[#1e2535] text-slate-200">
      <nav id="nav" className="flex justify-center gap-6 border-b border-slate-700 bg-[#12192a] p-4 shadow-md">
        <Link to="/camp/craft" className="font-medium text-slate-400 hover:text-emerald-400 transition-colors">Imprimerie</Link>
        <Link to="/camp/oven" className="font-medium text-slate-400 hover:text-emerald-400 transition-colors">Four</Link>
        <Link to="/craft" className="font-medium text-slate-400 hover:text-emerald-400 transition-colors">Craft</Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default CampLayout;