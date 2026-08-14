import { motion } from "framer-motion";

import { radialGlow, progressGradient } from "../../../animations/gradients.js";
import { SPRING_POP } from "../../../animations/springs.js";
import { useHoldProgress } from "../../../hooks/useHoldProgress.js";
import { PILL_BUTTON_BASE } from "./styles.js";
import { cx } from "../../../utils/classNames.js";

const ButtonHold = ({children, holdDuration = 2000, onClick, disabled = false,
                      className = ""}) => {
  const { progress, holding, success, startHold, stopHold } = useHoldProgress({
    holdDuration, onClick, disabled,
  });

  return (
    <motion.button
      disabled={disabled}
      onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} onPointerCancel={stopHold}

      animate={{
        scale:
          holding ? 1.02 : 1,
      }}

      transition={SPRING_POP}

      className={cx(
        "relative overflow-hidden inline-flex items-center justify-center gap-2",
        "rounded-lg px-5 py-2.5 font-semibold text-white bg-emerald-600",
        "shadow-lg shadow-emerald-900/40 select-none transition-colors",
        PILL_BUTTON_BASE,
        className
      )}
    >

      {/* Halo magique */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: radialGlow(progress),
          opacity: holding ? 1 : 0,
          transition: "opacity .2s",
        }}
      />

      {/* Barre de chargement */}
      <span
        className="absolute bottom-0 left-0 h-1 w-full pointer-events-none"
        style={{
          background: progressGradient(progress),
        }}
      />

      {
        success && (
          <motion.span
            className="absolute inset-0 rounded-full bg-white/60 pointer-events-none"

            initial={{
              scale: 0,
              opacity: 1
            }}

            animate={{
              scale: 3,
              opacity: 0
            }}

            transition={{
              duration: .5
            }}
          />
        )
      }

      {/* Contenu */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

      {/* Pour debug éventuel */}
      {/*
      <span className="absolute right-2 text-xs opacity-50">
        {Math.round(progress * 100)}%
      </span>
      */}
    </motion.button>
  );
}


export default ButtonHold;