import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Vector from '../../utils/vector.js';
import { START_POSITION } from '../../config/mapConfig.js';
import { useMap } from './MapProvider.jsx';
import {invoke} from "@tauri-apps/api/core";
import {listen} from "@tauri-apps/api/event";

const PlayerContext = createContext(null);
const STEP_DURATION_MS = 220;
const FEEDBACK_DURATION_MS = 2500;

/**
 * PlayerProvider - déplace le joueur case par case le long du chemin le plus
 * court (A*) vers la case cliquée, et remonte un message clair quand le
 * déplacement est impossible plutôt que de rester silencieux.
 */
export const PlayerProvider = ({ children }) => {
  const { map, terrain } = useMap();
  if (!map) return

  const [position, setPosition] = useState(new Vector(START_POSITION.x, START_POSITION.y));
  const [isMoving, setIsMoving] = useState(false);
  const [feedback, setFeedback] = useState(null);


  useEffect(() => {
    if (!feedback) return undefined;
    const id = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    return () => clearTimeout(id);
  }, [feedback]);

  const moveTo = useCallback(
    async (target) => {
      if (isMoving) return;

      const destination = terrain[map.get(target).id];
      if (!destination?.walkable) {
        setFeedback("Cette case n'est pas praticable.");
        return;
      }

      invoke("engine", {command: {Move: {position: target}}}).then()
    },
    [position, isMoving, map]
  );

  listen('move_path', (event) => {
    console.log(event)
    let path = event?.payload

    if (!path || path.length < 2) {
      if (!path) setFeedback('Aucun chemin possible vers cette case.');
      return;
    }

    setFeedback(null);
    setIsMoving(true);

    let step = 1;
    const interval = setInterval(() => {
      setPosition(path[step]);
      step += 1;
      if (step >= path.length) {
        clearInterval(interval);
        setIsMoving(false);
      }
    }, STEP_DURATION_MS);
  })



  const value = {
    position,
    isMoving,
    feedback,
    currentTile: map.get(position),
    moveTo,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a <PlayerProvider>');
  return ctx;
};
