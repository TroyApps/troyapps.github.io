export const GEOMETRY_KINDS = ["orbit", "triangle", "hexagon", "diamond", "cube"];

export function particleBudget(viewportWidth, reducedMotion = false) {
  if (reducedMotion) return 36;
  return Math.max(36, Math.min(60, Math.round(viewportWidth / 40 + 16)));
}

function pointOnPolyline(vertices, progress) {
  const wrapped = ((progress % 1) + 1) % 1;
  const scaled = wrapped * vertices.length;
  const index = Math.floor(scaled) % vertices.length;
  const next = (index + 1) % vertices.length;
  const amount = scaled - Math.floor(scaled);
  return {
    x: vertices[index].x + (vertices[next].x - vertices[index].x) * amount,
    y: vertices[index].y + (vertices[next].y - vertices[index].y) * amount,
  };
}

function regularPolygon(sides, rotation = -Math.PI / 2) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index / sides) * Math.PI * 2;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });
}

export function buildGeometryTargets({ kind, count, centerX, centerY, scale, phase = 0 }) {
  if (!Number.isFinite(count) || count <= 0) return [];

  let vertices;
  if (kind === "triangle") {
    vertices = regularPolygon(3);
  } else if (kind === "hexagon") {
    vertices = regularPolygon(6);
  } else if (kind === "diamond") {
    vertices = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  } else if (kind === "cube") {
    vertices = [
      { x: -0.8, y: -0.65 }, { x: 0.35, y: -0.65 }, { x: 0.35, y: 0.5 },
      { x: -0.8, y: 0.5 }, { x: -0.8, y: -0.65 }, { x: -0.35, y: -1 },
      { x: 0.8, y: -1 }, { x: 0.8, y: 0.15 }, { x: 0.35, y: 0.5 },
      { x: 0.8, y: 0.15 }, { x: -0.35, y: 0.15 }, { x: -0.8, y: 0.5 },
      { x: -0.35, y: 0.15 }, { x: -0.35, y: -1 },
    ];
  } else {
    return Array.from({ length: count }, (_, index) => {
      const lane = index % 3;
      const angle = phase + (index / count) * Math.PI * 2;
      const radiusX = scale * (lane === 0 ? 1 : lane === 1 ? 0.7 : 0.42);
      const radiusY = radiusX * (lane === 2 ? 1 : 0.58);
      return { x: centerX + Math.cos(angle) * radiusX, y: centerY + Math.sin(angle) * radiusY };
    });
  }

  return Array.from({ length: count }, (_, index) => {
    const point = pointOnPolyline(vertices, index / count + phase / (Math.PI * 2));
    return { x: centerX + point.x * scale, y: centerY + point.y * scale };
  });
}

export function morphPoint(from, to, progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  const eased = clamped * clamped * (3 - 2 * clamped);
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
  };
}

export function chooseNextPattern(current, random = Math.random) {
  const candidates = GEOMETRY_KINDS.filter((kind) => kind !== current);
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[Math.max(0, index)];
}
