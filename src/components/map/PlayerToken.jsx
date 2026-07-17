import React, { useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';


/**
 * PlayerToken - marqueur du joueur. Le déplacement pixel est interpolé en
 * continu par un ressort (spring), ce qui absorbe naturellement les
 * changements de cible en cours de route (contrairement à une transition
 * CSS à durée fixe qui "reset" à chaque nouveau tick).
 */
const PlayerToken = ({ position, radius }) => {
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const bounce = useMotionValue(1);

  useEffect(() => {
    const controlsX = animate(x, position.x, {
      type: 'spring',
      stiffness: 260,
      damping: 22,
      mass: 0.6,
    });
    const controlsY = animate(y, position.y, {
      type: 'spring',
      stiffness: 260,
      damping: 22,
      mass: 0.6,
    });
    // petit "rebond" à chaque étape, pour accentuer la sensation de marche
    const controlsBounce = animate(bounce, [1, 1.16, 1], {
      duration: 0.28,
      ease: 'easeOut',
    });

    return () => {
      controlsX.stop();
      controlsY.stop();
      controlsBounce.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.x, position.y]);

  return (
    <motion.g style={{ x, y }} className="pointer-events-none">
      <motion.circle style={{ scale: bounce }} r={radius} fill="#f59e0b" stroke="#78350f" strokeWidth={4} />
      <circle r={radius * 0.42} fill="#fde68a" />
    </motion.g>
  );
};

export default PlayerToken;
