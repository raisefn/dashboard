export interface GalaxyPosition {
  x: number;
  y: number;
  depth: number;
  size: number;
  opacity: number;
  speed: number;
}

export function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function generatePositions(
  count: number,
  seedOffset = 13,
  seedMultiplier = 7,
): GalaxyPosition[] {
  const positions: GalaxyPosition[] = [];

  for (let i = 0; i < count; i++) {
    const seed = i * seedMultiplier + seedOffset;
    const angle = seededRandom(seed) * Math.PI * 2;
    const dist = 180 + seededRandom(seed + 1) * 200;
    const depth = seededRandom(seed + 2);
    const depthScale = 0.3 + depth * 0.7;

    positions.push({
      x: 400 + Math.cos(angle) * dist * (0.7 + depth * 0.3),
      y: 400 + Math.sin(angle) * dist * (0.7 + depth * 0.3),
      depth,
      size: depthScale,
      opacity: 0.25 + depth * 0.75,
      speed: 3 + (1 - depth) * 4,
    });
  }

  // Push overlapping nodes apart
  const minDist = 90;
  for (let pass = 0; pass < 10; pass++) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist && d > 0) {
          const push = (minDist - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          positions[i].x -= nx * push;
          positions[i].y -= ny * push;
          positions[j].x += nx * push;
          positions[j].y += ny * push;
        }
      }
    }
  }

  return positions;
}
