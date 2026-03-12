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
    const dist = 160 + seededRandom(seed + 1) * 240;
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
  return positions;
}
