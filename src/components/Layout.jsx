import { Link, Outlet } from "react-router-dom";
import {usePlayer} from "../providers/map/PlayerProvider.jsx";

function Layout() {
  const { currentTile } = usePlayer();

  const isCamp = currentTile?.id === "camp";

  return (
    <div className="min-h-screen bg-[#1e2535] text-slate-200">
      <nav id="nav" className="flex justify-center gap-6 border-b border-slate-700 bg-[#161d2e] p-4 shadow-md">
        <Link to="/"
              className={`font-medium ${!isCamp ? "text-slate-500" : "text-slate-300"} hover:text-emerald-400 transition-colors`}
              style={{
                pointerEvents: !isCamp ? "none" : "auto"
              }}
        >Campement</Link>
        <Link to="/settings" className="font-medium text-slate-300 hover:text-emerald-400 transition-colors">Paramètres</Link>
        <Link to="/carte" className="font-medium text-slate-300 hover:text-emerald-400 transition-colors">Carte</Link>
        <Link to="/exploit"
              className={`font-medium ${isCamp ? "text-slate-500" : "text-slate-300"} hover:text-emerald-400 transition-colors`}
              style={{
                pointerEvents: isCamp ? "none" : "auto"
              }}
        >Exploitation</Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default Layout;