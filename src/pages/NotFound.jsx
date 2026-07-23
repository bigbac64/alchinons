import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/Button/Button.jsx";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.span
          className="mb-4 inline-block text-6xl"
          animate={{ rotate: [0, -8, 8, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
        >
          ⚗
        </motion.span>

        <p className="mb-2 text-sm uppercase tracking-widest text-slate-400">
          Formule inconnue
        </p>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-100">
          Cette page s'est volatilisée
        </h1>

        <p className="mb-10 text-slate-400">
          Le grimoire ne contient aucune recette à{" "}
          <code className="rounded bg-[#161d2e] px-1.5 py-0.5 text-emerald-400">
            {typeof window !== "undefined" ? window.location.pathname : ""}
          </code>
          . Elle a peut-être raté dans le chaudron.
        </p>

        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="font-medium text-slate-300 hover:text-emerald-400 transition-colors"
          >
            ← Retour
          </button>
          <Link to="/">
            <Button variant="classic">
              Retour au campement
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;