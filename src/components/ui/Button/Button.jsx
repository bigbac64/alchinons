import { forwardRef } from "react";
import { motion } from "framer-motion";

import ButtonHold from "./ButtonHold";
import ButtonDumper from "./ButtonDumper.jsx";
import { SPRING_POP } from "../../../animations/springs.js";
import { PILL_BUTTON_BASE } from "./styles.js";
import { cx } from "../../../utils/classNames.js";


const variants = {
  classic: {
    whileHover: {
      scale: 1.02,
    },

    whileTap: {
      scale: 0.99,
    },
  },
};


const Button = forwardRef( (
  {
    children, variant = "classic", onClick, holdDuration = 2000,
    disabled = false, className = "", type = "button", ...props
  },
  ref) => {


    /*
     * HOLD BUTTON
     *
     * Le composant garde
     * toute sa logique interne.
     */
    if (variant === "hold") {

      return (
        <ButtonHold ref={ref} holdDuration={holdDuration} onClick={onClick}
                    disabled={disabled} className={className}
        >
          {children}
        </ButtonHold>
      );
    }

    /*
     * DUMPER
     *
     * Sera remplacé par
     * ButtonDumper.jsx
     */
    if (variant === "dumper") {

      return (
        <ButtonDumper ref={ref} onClick={onClick} disabled={disabled} className={className}>
          {children}
        </ButtonDumper>
      );
    }


    /*
     * CLASSIC BUTTON
     */
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileHover={
          variants.classic.whileHover
        }
        whileTap={
          variants.classic.whileTap
        }
        transition={SPRING_POP}

        className={cx(
          "group relative overflow-hidden inline-flex items-center justify-center gap-2",
          "rounded-lg px-5 py-2.5 font-semibold text-white bg-emerald-600",
          "shadow-lg shadow-emerald-900/40 select-none transition-colors",
          PILL_BUTTON_BASE,
          className
        )}
        {...props}

      >

        {/* reflet hover */}
        <span
          className="
            absolute inset-0
            -translate-x-full bg-linear-to-r
            from-transparent via-white/20 to-transparent
            group-hover:translate-x-full transition-transform
            duration-700
          "
        />

        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>

      </motion.button>
    );
  }
);


Button.displayName = "Button";


export default Button;