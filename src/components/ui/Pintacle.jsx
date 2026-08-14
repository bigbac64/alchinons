import React from 'react';

const variants = {
  "polygon": (p) => {
    const points = [];

    for (let i = 0; i < p.length; i++) {
      points.push(`${p[i].x.toFixed(1)},${p[i].y.toFixed(1)}`);
    }

    return <polygon points={points.join(" ")} fill="none" stroke="#314158"/>;
  },
  "line": (p) => {
    const lines = [];

    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        lines.push(
          <line
            key={`${i}-${j}`}
            x1={p[i].x}
            y1={p[i].y}
            x2={p[j].x}
            y2={p[j].y}
            stroke="#314158"
          />
        );
      }
    }

    return lines
  },
  "star": (p) => {
    const n = p.length;
    const lines = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const isAdjacent = j - i === 1 || (i === 0 && j === n - 1);
        if (isAdjacent) continue; // on saute les voisins directs
        lines.push(
          <line
            key={`${i}-${j}`}
            x1={p[i].x}
            y1={p[i].y}
            x2={p[j].x}
            y2={p[j].y}
            stroke="#314158"
          />
        );
      }
    }
    return lines;
  },
}

const Pintacle = (props) => {
  const {className, sides, variant="line", ...other} = props;

  function getPolygonVertices(n, cx = 50, cy = 50, r = 50) {
    const vertices = [];
    for (let k = 0; k < n; k++) {
      const angleDeg = -90 + k * (360 / n);
      const angleRad = (angleDeg * Math.PI) / 180;
      vertices.push({
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad),
      });
    }
    return vertices;
  }

  const points = getPolygonVertices(sides);

  return (
    <svg className={`absolute scale-[30%] opacity-35 ${className}`} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...other}>
      <circle cx="50" cy="50" r="50" fill="none" stroke="#314158"/>
      {variants[variant](points)}
    </svg>
  );
}

export default Pintacle;