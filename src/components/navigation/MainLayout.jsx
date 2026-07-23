import { Link, Outlet } from "react-router-dom";
import {usePlayer} from "../../providers/map/PlayerProvider.jsx";

function MainLayout() {
  const { currentTile } = usePlayer();

  const isCamp = currentTile?.id === "camp";

  return (
    <div className="min-h-screen bg-[#1e2535] text-slate-200">
      <nav id="nav" className="flex justify-center gap-6 border-b border-slate-700 bg-[#161d2e] p-4 shadow-md">
        <Link to="/camp"
              className={`font-medium ${!isCamp ? "text-slate-500" : "text-slate-300"} hover:text-emerald-400 transition-colors`}
              style={{
                pointerEvents: !isCamp ? "none" : "auto"
              }}
        >Campement</Link>
        <Link to="/carte" className="font-medium text-slate-300 hover:text-emerald-400 transition-colors">Carte</Link>
        <Link to="/exploit"
              className={`font-medium ${isCamp ? "text-slate-600" : "text-slate-300"} hover:text-emerald-400 transition-colors`}
              style={{
                pointerEvents: isCamp ? "none" : "auto"
              }}
        >Exploitation</Link>
        <Link to="/settings" className="font-medium text-slate-300 hover:text-emerald-400 transition-colors">Paramètres</Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default MainLayout;