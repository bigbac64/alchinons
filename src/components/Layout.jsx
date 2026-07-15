import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen bg-[#1e2535] text-slate-200">
      <nav id="nav" className="flex justify-center gap-6 border-b border-slate-700 bg-[#161d2e] p-4 shadow-md">
        <Link to="/" className="font-medium text-slate-300 hover:text-emerald-400 transition-colors">Accueil</Link>
        <Link to="/settings" className="font-medium text-slate-300 hover:text-emerald-400 transition-colors">Paramètres</Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default Layout;