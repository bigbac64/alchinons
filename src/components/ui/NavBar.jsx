import { Link } from "react-router-dom";

/**
 * Barre de navigation générique : rend une liste de liens fournie par
 * l'appelant. Ne connaît ni Context ni logique métier — le style et l'état
 * actif/désactivé de chaque lien sont entièrement décidés par l'appelant.
 * @param {{links: {to: string, label: string, className?: string, style?: object}[], className?: string}} props
 */
export default function NavBar({ links, className = "" }) {
  return (
    <nav id="nav" className={`flex justify-center gap-6 border-b border-slate-700 p-4 shadow-md ${className}`}>
      {links.map((link) => (
        <Link key={link.to} to={link.to} className={link.className} style={link.style}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
