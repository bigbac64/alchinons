import React, {useCallback, useEffect, useState} from 'react';
import Slot from "../ui/dnd/Slot.jsx";
import { motion, animate } from "framer-motion";
import Button from "../ui/Button/Button.jsx";
import Pintacle from "../ui/Pintacle.jsx";
import Panel from "../ui/Panel.jsx";

const randomizer_idle_gen = () => Array.from(
  { length: Math.floor(Math.random() * 8) + 2 },
  () => [-2, 0, 2][Math.floor(Math.random() * 3)]
)


const radius = 150;
const ORBIT_STEPS = 60; // plus de points = rotation plus fluide

const variants = (state={}) => {
  const { position = {x: 0, y:0}, startAngle = 0, turns = 1 } = state;

  // Génère un tableau de valeurs le long du cercle, en partant de startAngle
  const genOrbit = (fn) =>
    Array.from({ length: ORBIT_STEPS + 1 }, (_, i) => {
      const t = i / ORBIT_STEPS;
      const angle = startAngle + t * turns * 2 * Math.PI;
      return fn(angle, t);
    });

  return {
    initial: {
      x: position.x,
      y: position.y,
      scale: 1,
      opacity: 1,
      boxShadow: "0 0 0px rgba(0,0,0,0)",
    },
    appear: {
      x: [0, position.x],
      y: [0, position.y],
      scale: [0.5, 1],
      opacity: [0, 1],
      boxShadow: "0 0 0px rgba(0,0,0,0)",
      transition: { duration: 1.5, ease: "easeOut" },
    },
    idle: {
      x: [0, ...randomizer_idle_gen(), 0].map((self) => position.x + self),
      y: [0, ...randomizer_idle_gen(), 0].map((self) => position.y + self),
      rotate: randomizer_idle_gen(),
      boxShadow: "0 0 0px rgba(0,0,0,0)",
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "linear"
      },
    },
    action: {
      x: genOrbit((angle, t) => radius * (1 - t) * Math.cos(angle)),
      y: genOrbit((angle, t) => radius * (1 - t) * Math.sin(angle)),
      boxShadow: "0 0 0px rgba(0,0,0,0)",
      transition: {
        duration: 3,
        times: Array.from({ length: ORBIT_STEPS + 1 }, (_, i) =>
          1 - Math.pow(1 - i / ORBIT_STEPS, 3)
        ),
        ease: "easeIn"
      },
    },
    shine: {
      x: randomizer_idle_gen(),
      y: randomizer_idle_gen(),
      rotate: randomizer_idle_gen(),
      borderColor: "#1fb61b", //1fb61b
      scale: 0.8,
      boxShadow: [
        "0 0 5px #72e170, 0 0 10px #72e170, 0 0 20px #72e170",
        "0 0 10px #72e170, 0 0 20px #72e170, 0 0 40px #72e170",
        "0 0 5px #72e170, 0 0 10px #72e170, 0 0 20px #72e170",
      ],
      transition: {
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    }
  };
};


const ArcheTable = (props) => {
  const {className, children, count=3, resources, result, action, onEraseSlot, ...other} = props;
  const [animation, setAnimation] = useState("appear");

  useEffect(() => {
    if(action) setAnimation("action");
  }, [action]);

  const reset = () => {
    Array(count).fill(null).map((_, i) => onEraseSlot(i)); // reset les sots
    setAnimation("appear");
  }


  return (
    <div className={`relative flex p-3 justify-center items-center w-full min-h-100 h-[33vh] border border-slate-700 bg-surface-panel rounded-2xl ${className}`} {...other}>
      {
        Array(count).fill(null).map((_, i) => {
          const angle = i * 2 * Math.PI / count - Math.PI/2
          return <motion.div
            className={"absolute z-10"}
            variants={variants({
              position: {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
              },
              startAngle: angle,
              turns: 2,
            })}
            initial="initial"
            animate={animation}
            onAnimationComplete={(definition) => {
              switch (definition){
                case "appear": {
                  setAnimation("idle")
                  break
                }
                case "action": {
                  setAnimation("shine")
                }
              }
            }}
          >
            <Slot
              key={`archemsitery-${i}`}
              resource={resources?.[i]}
              onClick={resources?.[i] && animation === "idle" ? () => onEraseSlot(i) : undefined}
            />
          </motion.div>
        })
      }
      <Slot
        className={"absolute z-20 bg-slate-800"}
        onClick={animation === "shine" ? reset : undefined}
        resource={result || {name: "empty"}}
      />
      <Pintacle className={"absolute min-w-4xl"} variant={count < 5 ? "line" : "star"} sides={count}/>
    </div>
  );
}

export default ArcheTable;