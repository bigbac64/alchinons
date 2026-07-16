class Vector {

  static get zero() {
    return new Vector(0, 0);
  }

  /**
   * Crée un nouveau vecteur avec les coordonnées spécifiées.
   * @param {number} x - La coordonnée horizontale.
   * @param {number} y - La coordonnée verticale.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Calcule la magnitude (longueur) du vecteur.
   * @returns {number}
   */
  get magnitude() {
    const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    return Math.abs(magnitude - 1) < Number.EPSILON ? 1 : magnitude;
  }

  /**
   * Retourne un nouveau vecteur normalisé (même direction, magnitude de 1).
   * @returns {Vector}
   */
  get normalize() {
    const mag = this.magnitude;
    return mag === 0 ? Vector.zero : new Vector(this.x / mag, this.y / mag);
  }

  /**
   * Distance entre ce vecteur et un autre.
   * @param {Object} vector
   * @returns {number}
   */
  distance(vector) {
    return Math.abs(new Vector(vector.x - this.x, vector.y - this.y).magnitude);
  }

  get perpendicular() {
    return new Vector(-this.y, this.x);
  }

  add(other) {
    if (other instanceof Vector) {
      return new Vector(this.x + other.x, this.y + other.y);
    } else if (typeof other === 'number') {
      return new Vector(this.x + other, this.y + other);
    }
  }

  sub(other) {
    if (other instanceof Vector) {
      return new Vector(this.x - other.x, this.y - other.y);
    } else if (typeof other === 'number') {
      return new Vector(this.x - other, this.y - other);
    }
  }

  scale(other) {
    return new Vector(this.x * other, this.y * other);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  determinant(other) {
    return this.x * other.y - this.y * other.x;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}

export default Vector;
