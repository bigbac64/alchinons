import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

import {
  radialGlow,
  progressGradient,
  easeOutCubic,
} from "../../utils/animation";


const TIMEOUT_SUCCESS_ANIMATION = 400

const ButtonHold = ({children, holdDuration = 2000, onComplete, disabled = false,
                      className = ""}) => {
  const continueHoldRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [success, setSuccess] = useState(false);

  const frameRef = useRef(null);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

  /*
   * Animation principale du chargement
   */
  const updateProgress = useCallback(
    (time) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }

      const elapsed = time - startTimeRef.current;
      const rawProgress = Math.min(
        elapsed / holdDuration,
        1
      );

      const eased = easeOutCubic(rawProgress);
      setProgress(eased);

      if (rawProgress >= 1) {
        completedRef.current = true;
        setHolding(false);
        setSuccess(true);

        // attend la fin de l'effet visuel
        setTimeout(() => {
          setSuccess(false);
        }, TIMEOUT_SUCCESS_ANIMATION);

        setProgress(0);

        if (onComplete) {
          onComplete();
        }

        if (continueHoldRef.current) {
          startTimeRef.current = null;

          frameRef.current = requestAnimationFrame(updateProgress);
        }
        return;
      }

      frameRef.current = requestAnimationFrame(updateProgress);
    },
    [holdDuration, onComplete]
  );


  /*
   * Début maintien
   */
  function startHold(event) {
    if (disabled)
      return;

    event.preventDefault();
    continueHoldRef.current = true;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    completedRef.current = false;
    startTimeRef.current = null;

    setHolding(true);

    frameRef.current = requestAnimationFrame(updateProgress);
  }

  /*
   * Fin maintien
   */
  function stopHold() {

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    startTimeRef.current = null;

    /*
     * Si terminé, on laisse
     * l'état final quelques instants
     */
    if (completedRef.current) {
      setProgress(0);
      completedRef.current = false;
      return;
    }

    setHolding(false);

    /*
     * Retour doux à zéro
     */
    setProgress(current => {
      return current > 0 ? 0 : current;
    });
  }

  return (
    <motion.button
      disabled={disabled}
      onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} onPointerCancel={stopHold}

      animate={{
        scale:
          holding ? 1.02 : 1,
      }}

      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}

      className={`relative overflow-hidden inline-flex items-center justify-center gap-2
                  rounded-lg px-5 py-2.5
                  font-semibold text-white bg-emerald-600
                  shadow-lg shadow-emerald-900/40
                  hover:bg-emerald-500
                  active:scale-95
                  select-none
                  transition-colors
                  ${className}`}
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