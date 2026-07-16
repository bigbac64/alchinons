import { forwardRef, useRef, useState } from "react";
import { motion, animate } from "framer-motion";

import { shake } from "../../utils/animation";

const ButtonDumper = forwardRef(({
      children,
      onClick,
      duration_dump = 0.15,
      disabled = false,
      className = "",
    },
    ref
) => {
  const buttonRef = useRef(null);
  const [impact, setImpact] = useState(false);
  const [flash, setFlash] = useState(false);
  const [pressed,setPressed] = useState(false);

// fusion ref interne + externe
  function setRefs(node){

    buttonRef.current = node;

    if(typeof ref === "function"){
      ref(node);
    }
    else if(ref){
      ref.current = node;
    }
  }

  async function handleClick(){
    if(disabled)
      return;

    const button = buttonRef.current;

    if(!button)
      return;

    setPressed(true);

    /*
     * Phase écrasement
     *
     * Lent au début
     * accélération vers impact
     */
    await animate(
      button,
      {
        scale: [1, 0.96, 0.78],
        y: [0.5, 1, 4],
        boxShadow: [
          "0 10px 20px rgba(0,0,0,.35)",
          "0 5px 10px rgba(0,0,0,.25)",
          "0 0px 0 rgba(0,0,0,.1)"
        ]
      },
      {
        duration: duration_dump,
        ease: [0.55, 0, 1, 0.45]
      }
    ).finished;

    /*
     * Impact
     */
    await new Promise(resolve => setTimeout(resolve, 20)); // waiter

    setFlash(true);
    setImpact(true);

    shake({
      intensity:8,
      duration:160
    });

    setTimeout(() => setFlash(false), 180);
    setTimeout(() => setImpact(false), 640);

    /*
     * Commande après impact
     */
    if(onClick){
      onClick();
    }

    /*
     * Retour du bouton
     */
    await animate(
      button,
      {
        scale: [0.78, 1.05, 1],
        y: [4, -1, 0],
        boxShadow: [
          "0 0 0 rgba(0,0,0,.1)",
          "0 12px 20px rgba(0,0,0,.4)",
          "0 10px 20px rgba(0,0,0,.35)"
        ]
      },
      {
        type: "spring",
        stiffness: 400,
        damping: 18
      }
    ).finished;

    setPressed(false);

  }

  return <motion.button ref={setRefs} disabled={disabled} onClick={handleClick}
            className={`relative
                       inline-flex items-center justify-center gap-2 rounded-lg
                       px-5 py-2.5
                       font-semibold text-white
                       bg-emerald-600 border-b-4 border-emerald-900
                       shadow-lg shadow-emerald-900/40
                       select-none
                       disabled:opacity-50 ${className}`}
    >
      {pressed && (
          <motion.span className="absolute inset-0 bg-white/20 pointer-events-none"
            initial={{
              opacity: 0
            }}

            animate={{
              opacity: [0, 1, 0]
            }}

            transition={{
              duration: .25
            }}

          />
        )
      }

      { impact && (
        <motion.span className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "inherit",
            clipPath: "inherit",
          }}

          initial={{
            boxShadow: "0 0 10px rgba(255,255,255,1), inset 0 0 10px rgba(255,255,255,1)",
            scale: 0.8,
            opacity: 1
          }}

          animate={{
            boxShadow: "0 0 30px rgba(255,255,255,1), inset 0 0 10px rgba(255,255,255,1)",
            scaleX: 4.,
            scaleY: 4.45,
            y: 5,
            opacity: [0.2, 0.05, 0.0001, 0, 0]
          }}

          transition={{
            duration: .42,
            ease: [0.16, 1, 0.3, 1]
          }}
        />)
      }

      { flash && (
        <motion.span className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius:"inherit",
            clipPath:"inherit",
            background:"rgba(255,255,255,.40)",
            mixBlendMode:"screen"
          }}

          initial={{
            opacity:0,
            scale:.96
          }}

          animate={{
            opacity:[0,.85,0],
            scale:[.96,1.02,1]
          }}

          transition={{
            duration:.16
          }}
        />)
      }

      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
});


ButtonDumper.displayName="ButtonDumper";


export default ButtonDumper;