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

export function progressGradient(progress) {
  const pct = progress * 100;

  return `linear-gradient(
90deg,
rgb(16 95 99) ${pct}%,
rgba(255,255,255,.08) ${pct}%)
`;
}
