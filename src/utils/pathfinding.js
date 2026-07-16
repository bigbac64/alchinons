import Vector from "./vector.js";

class PathNode {
  /**
   * @param {Vector} position
   * @param {number} g - coût depuis le départ
   * @param {number} h - heuristique jusqu'au but
   * @param {PathNode|null} parent
   */
  constructor(position, g = 0, h = 0, parent = null) {
    this.position = position;
    this.g = g;
    this.h = h;
    this.f = g + h;
    this.parent = parent;
  }
}

/**
 * Pathfinder - recherche de chemin A* sur une grille hexagonale (offset columns).
 */
class Pathfinder {
  constructor(matrix) {
    this.matrix = matrix;
    this.openSet = [];
    this.closedSet = new Set();
  }

  findPath(start, end) {
    const destination = this.matrix.get(end);
    if (!destination || destination.cost === 0) {
      return null;
    }

    this.openSet = [new PathNode(start, 0, this.hexDistance(start, end))];
    this.closedSet.clear();

    while (this.openSet.length > 0) {
      let currentNode = this.openSet[0];
      this.openSet.forEach((node) => (currentNode = node.f < currentNode.f ? node : currentNode));

      if (currentNode.position.equals(end)) {
        return this.reconstructPath(currentNode);
      }

      this.openSet = this.openSet.filter((node) => node !== currentNode);
      this.closedSet.add(`${currentNode.position.x},${currentNode.position.y}`);
      this.exploreNeighbors(currentNode, end);
    }

    return null;
  }

  exploreNeighbors(currentNode, end) {
    // déplacement matriciel adapté à une grille hexagonale (colonnes en quinconce)
    const directions = [
      [
        new Vector(1, 0), new Vector(0, -1), new Vector(0, 1),
        new Vector(-1, 0), new Vector(-1, -1), new Vector(1, -1),
      ],
      [
        new Vector(1, 0), new Vector(0, -1), new Vector(0, 1),
        new Vector(-1, 0), new Vector(-1, 1), new Vector(1, 1),
      ],
    ];

    const orientation = currentNode.position.x % 2;
    directions[orientation].forEach((dir) => {
      const neighborPos = currentNode.position.add(dir);
      const cell = this.matrix.get(neighborPos);
      if (cell && cell.cost !== 0 && !this.closedSet.has(`${neighborPos.x},${neighborPos.y}`)) {
        const g = currentNode.g + cell.cost;
        const h = this.hexDistance(neighborPos, end);
        const existingNode = this.openSet.find((node) => node.position.equals(neighborPos));

        if (!existingNode) {
          this.openSet.push(new PathNode(neighborPos, g, h, currentNode));
        } else if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.h = h;
          existingNode.f = g + h;
          existingNode.parent = currentNode;
        }
      }
    });
  }

  reconstructPath(node) {
    const path = [];
    while (node) {
      path.unshift(node.position);
      node = node.parent;
    }
    return path;
  }

  hexDistance(a, b) {
    const delta = a.sub(b);
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);
    return dx + Math.max(0, dy - dx / 2);
  }
}

export default Pathfinder;
