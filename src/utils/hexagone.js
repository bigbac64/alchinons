import Vector from "./vector.js";

/**
 * Hexagon - géométrie d'une grille hexagonale à pointes horizontales
 */
class Hexagon {
  constructor(radius) {
    this.radius = radius;
  }

  /**
   * Distance entre 2 hexagones voisins en fonction de l'écart (gap).
   * @param gap
   * @returns {Vector}
   */
  range(gap = 0) {
    return new Vector(
      1.5 * this.radius + gap,
      this.height() + gap
    );
  }

  /**
   * Position en pixels d'un hexagone selon sa position logique (colonne/ligne).
   * @param point {Vector} position logique (x = colonne, y = ligne)
   * @param gap écart entre les hexagones
   * @returns {Vector}
   */
  next(point, gap = 0) {
    const r = this.range(gap);
    return new Vector(
      point.x * r.x + this.radius,
      (point.x % 2 === 0
        ? point.y * r.y
        : point.y * r.y + r.y / 2) + this.range().y / 2
    );
  }

  height() {
    return this.radius * Math.sqrt(3);
  }

  width() {
    return this.radius * 2;
  }

  /**
   * Génère les 6 sommets de l'hexagone autour d'un point central.
   * @param from {Vector}
   * @returns {string[]}
   */
  points(from) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = from.x + this.radius * Math.cos(angle);
      const py = from.y + this.radius * Math.sin(angle);
      points.push(`${px},${py}`);
    }
    return points;
  }

  /**
   * Taille totale (en pixels) d'une grille de `width` x `height` hexagones.
   */
  calculateFullSize(width, height, gap) {
    return new Vector(
      width * this.range(gap).x + this.radius / 2 - gap,
      height * this.range(gap).y + (width > 1 ? this.range(gap).y / 2 - gap : -gap)
    );
  }
}

export default Hexagon;
