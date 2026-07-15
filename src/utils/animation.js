import { animate } from "framer-motion";

/* ============================================================
 * Screen Shake
 * ============================================================ */

let activeShake = null;

export function shake({
                        target = document.getElementById("root"),
                        intensity = 6,
                        duration = 180,
                      } = {}) {
  if (!target) return;

  // Annule l'ancien shake
  if (activeShake) {
    activeShake.stop();
    activeShake = null;
    target.style.transform = "";
  }

  const frames = Math.max(8, Math.floor(duration / 18));

  const x = [0];
  const y = [0];

  for (let i = 0; i < frames; i++) {
    x.push((Math.random() - 0.5) * intensity);
    y.push((Math.random() - 0.5) * intensity);
  }

  x.push(0);
  y.push(0);

  activeShake = animate(
    0,
    1,
    {
      duration: duration / 1000,
      ease: "easeOut",
      onUpdate(latest) {
        const index = Math.floor(latest * (x.length - 1));

        target.style.transform = `translate(${x[index]}px, ${y[index]}px)`;
      },
      onComplete() {
        target.style.transform = "";
        activeShake = null;
      },
    }
  );
}

/* ============================================================
 * Hold helpers - Algo d'animation
 * ============================================================ */

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function progress(elapsed, duration) {
  return clamp(elapsed / duration);
}

export function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

export function easeInOutQuad(x) {
  return x < 0.5
    ? 2 * x * x
    : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

/* ============================================================
 * Radial Glow
 * ============================================================ */

export function radialGlow(progress) {
  const radius = 25 + progress * 130;
  const alpha = 0.06 + progress * 0.18;

  return `
radial-gradient(
circle at center,
rgba(255,255,255,${alpha}) 0%,
rgba(255,255,255,${alpha * 0.5}) ${radius * 0.35}%,
transparent ${radius}%)
`;
}

/* ============================================================
 * Progress Bar
 * ============================================================ */

export function progressGradient(progress) {
  const pct = progress * 100;

  return `linear-gradient(
90deg,
rgb(16 95 99) ${pct}%,
rgba(255,255,255,.08) ${pct}%)
`;
}

/* ============================================================
 * Dumper Animation
 * ============================================================ */

export async function playDumperAnimation(button) {
  if (!button) return;

  button.style.pointerEvents = "none";

  await animate(
    button,
    {
      y: 4,
      scale: 0.98,
    },
    {
      duration: 0.06,
    }
  ).finished;

  shake({
    intensity: 4,
    duration: 120,
  });

  await animate(
    button,
    {
      y: 0,
      scale: 1,
    },
    {
      type: "spring",
      stiffness: 500,
      damping: 18,
    }
  ).finished;

  button.style.pointerEvents = "";
}

/* ============================================================
 * Classic Hover
 * ============================================================ */

export async function pulse(button) {
  if (!button) return;

  await animate(
    button,
    {
      scale: [1, 1.04, 1],
    },
    {
      duration: .25,
    }
  ).finished;
}

/* ============================================================
 * Generic Helpers
 * ============================================================ */

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}