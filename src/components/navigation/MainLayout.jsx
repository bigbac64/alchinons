import {Outlet, useLocation} from "react-router-dom";
import NavBar from "../ui/NavBar.jsx";
import { useIsCamp } from "../../hooks/useIsCamp.js";

function MainLayout() {
  const isCamp = useIsCamp();

  const links = [
    {
      to: "/camp",
      label: "Campement",
      className: `font-medium ${!isCamp ? "text-slate-500" : "text-slate-300"} hover:text-emerald-400 transition-colors`,
      style: { pointerEvents: !isCamp ? "none" : "auto" },
    },
    {
      to: "/carte",
      label: "Carte",
      className: "font-medium text-slate-300 hover:text-emerald-400 transition-colors",
    },
    {
      to: "/exploit",
      label: "Exploitation",
      className: `font-medium ${isCamp ? "text-slate-600" : "text-slate-300"} hover:text-emerald-400 transition-colors`,
      style: { pointerEvents: isCamp ? "none" : "auto" },
    },
    {
      to: "/settings",
      label: "Paramètres",
      className: "font-medium text-slate-300 hover:text-emerald-400 transition-colors",
    },
  ];

  return (
    <div className="min-h-screen text-slate-200">
      <NavBar links={links} className="bg-surface-nav" />
      <Outlet />
    </div>
  );
}

export default MainLayout;
