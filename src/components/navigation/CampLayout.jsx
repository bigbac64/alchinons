import { Outlet } from "react-router-dom";
import NavBar from "../ui/NavBar.jsx";
import { useIsCamp } from "../../hooks/useIsCamp.js";
import { useProgression } from "../../providers/ProgressionProvider.jsx";
import { UNLOCKABLE } from "../../config/progression.js";

function CampLayout() {
  const isCamp = useIsCamp();
  const { isUnlocked } = useProgression();
  const ovenUnlocked = isUnlocked(UNLOCKABLE.OVEN);

  const links = [
    {
      to: "/camp/craft",
      label: "Imprimerie",
      className: "font-medium text-slate-400 hover:text-emerald-400 transition-colors",
    },
    {
      to: "/camp/oven",
      label: ovenUnlocked ? "Four" : "🔒 Four",
      className: `font-medium transition-colors ${ovenUnlocked ? "text-slate-400 hover:text-emerald-400" : "text-slate-600 hover:text-slate-500"}`,
    },
    {
      to: "/camp/quest",
      label: "Quêtes",
      className: "font-medium text-slate-400 hover:text-emerald-400 transition-colors",
    },
    {
      to: "/camp/arch",
      label: "Archemiste",
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
