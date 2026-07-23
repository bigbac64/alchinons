import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Vector from '../../utils/vector.js';
import { useMap } from './MapProvider.jsx';
import {listen} from "@tauri-apps/api/event";
import {getPlayer, listenEngineEvents, move} from "../../utils/api.js";

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

  const [position, setPosition] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    getPlayer().then(({x, y}) => {
      setPosition(new Vector(x, y))
    });
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;
    const id = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    return () => clearTimeout(id);
  }, [feedback]);

  const moveTo = useCallback(
    async (target) => {
      if (isMoving || !map) return;
      const destination = terrain[map.get(target).id];
      if (!destination?.walkable) {
        setFeedback("Cette case n'est pas praticable.");
        return;
      }
      move(target).then();
    },
    [position, isMoving, map, terrain]
  );

  useEffect(() => {

    const unlisten = listenEngineEvents({
      MovePath: (event) => {
        const path = event?.path;
        console.log("Moving to path: ", event);
        if (path.length < 2) {
          setFeedback('Vous êtes déjà sur cette case.');
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
      },
      MoveFailed: () => setFeedback('Aucun chemin possible vers cette case.'),
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  if (!map || !position) return null;

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
