import { animate } from "framer-motion";

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
