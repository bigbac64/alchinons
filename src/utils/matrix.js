import Vector from "./vector.js";

/**
 * Matrix - grille 2D générique indexée par Vector(x, y).
 * Version allégée : seules les méthodes utilisées par la carte hexagonale
 * et le pathfinding sont conservées.
 */
class Matrix {
  constructor() {
    this._matrix = null;
  }

  /**
   * Génère la matrice et la remplit selon `fields`.
   * @param size {Vector} largeur (x) et hauteur (y)
   * @param fields {*|function(Vector): *} valeur fixe, ou callback(at) => valeur
   */
  make(size, fields = null) {
    if (size.x < 1 || size.y < 1) {
      throw new Error("The matrix must have at least one column and one line");
    }

    this._matrix = [];
    for (let y = 0; y < size.y; y++) {
      this._matrix.push([]);
      for (let x = 0; x < size.x; x++) {
        this._matrix[y].push(
          fields instanceof Function ? fields(new Vector(x, y)) : fields
        );
      }
    }
  }

  flat() {
    return this._matrix.flat();
  }

  get length() {
    return new Vector(this._matrix[0].length, this._matrix.length);
  }

  get(at) {
    if (!at || at.x < 0 || at.y < 0 || at.x >= this.length.x || at.y >= this.length.y) {
      return undefined;
    }
    return this._matrix[at.y][at.x];
  }

  set(at, fields) {
    this._matrix[at.y][at.x] = fields instanceof Function ? fields(at, this.get(at)) : fields;
  }
}

export default Matrix;
