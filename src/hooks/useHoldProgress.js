import { useCallback, useRef, useState } from "react";
import { easeOutCubic } from "../utils/easing.js";

const TIMEOUT_SUCCESS_ANIMATION = 400;

/**
 * Logique d'un bouton "à maintien" : progression animée pendant l'appui,
 * déclenchement de `onClick` une fois `holdDuration` atteint, flash de
 * succès temporisé, et reprise immédiate d'un nouveau cycle si le pointeur
 * est toujours enfoncé au moment de la complétion (`continueHoldRef`).
 *
 * Extrait de `ButtonHold.jsx` à l'identique — c'est l'extraction la plus
 * sensible du projet (4 refs interdépendantes, boucle `requestAnimationFrame`
 * auto-entretenue) : ne pas modifier son comportement sans revérifier
 * manuellement les 5 scénarios listés dans FRONTEND_GUIDELINES.md §6.
 *
 * @param {{holdDuration: number, onClick?: () => void, disabled?: boolean}} params
 * @returns {{progress: number, holding: boolean, success: boolean, startHold: (event: PointerEvent) => void, stopHold: () => void}}
 */
export function useHoldProgress({ holdDuration, onClick, disabled = false }) {
  const continueHoldRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [success, setSuccess] = useState(false);

  const frameRef = useRef(null);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

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

        if (onClick) {
          onClick();
        }

        if (continueHoldRef.current) {
          startTimeRef.current = null;

          frameRef.current = requestAnimationFrame(updateProgress);
        }
        return;
      }

      frameRef.current = requestAnimationFrame(updateProgress);
    },
    [holdDuration, onClick]
  );

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

  return { progress, holding, success, startHold, stopHold };
}
