import { forwardRef } from "react";
import { motion } from "framer-motion";

import ButtonHold from "./ButtonHold";
import ButtonDumper from "./ButtonDumper.jsx";


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
    children, variant = "classic", onClick, onComplete, holdDuration = 2000,
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
        <ButtonHold ref={ref} holdDuration={holdDuration} onComplete={onComplete ?? onClick}
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
        <ButtonDumper ref={ref} onClick={onComplete ?? onClick} disabled={disabled} className={className}>
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
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
        }}

        className={`
          relative overflow-hidden
          inline-flex items-center justify-center gap-2
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          rounded-lg
          px-5 py-2.5
          font-semibold text-white bg-emerald-600 hover:bg-emerald-500
          shadow-lg shadow-emerald-900/40
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          select-none transition-colors
          ${className}
        `}
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