import { Outlet } from "react-router-dom";
import NavBar from "../ui/NavBar.jsx";
import { useIsCamp } from "../../hooks/useIsCamp.js";

function CampLayout() {
  const isCamp = useIsCamp();

  const links = [
    {
      to: "/camp/craft",
      label: "Imprimerie",
      className: "font-medium text-slate-400 hover:text-emerald-400 transition-colors",
    },
    {
      to: "/camp/oven",
      label: "Four",
      className: "font-medium text-slate-400 hover:text-emerald-400 transition-colors",
    },
  ];

  return isCamp && (
    <div className="min-h-full text-slate-200">
      <NavBar links={links} className="bg-surface-nav" />
      <Outlet />
    </div>
  );
}

export default CampLayout;
