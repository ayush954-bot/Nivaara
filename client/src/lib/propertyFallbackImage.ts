/**
 * Generates a professional canvas-based fallback image for a given property type.
 * Returns a data URL (PNG) that can be used as an <img> src or in canvas drawImage.
 * No external dependencies — works offline, no CORS issues.
 */

interface FallbackConfig {
  gradientTop: string;
  gradientBottom: string;
  accentColor: string;
  label: string;
  emoji: string;
}

const FALLBACK_CONFIGS: Record<string, FallbackConfig> = {
  land: {
    gradientTop: '#2d5a27',
    gradientBottom: '#1a3a16',
    accentColor: '#7ec850',
    label: 'Land / Plot',
    emoji: '🌿',
  },
  plot: {
    gradientTop: '#2d5a27',
    gradientBottom: '#1a3a16',
    accentColor: '#7ec850',
    label: 'Plot',
    emoji: '🌿',
  },
  apartment: {
    gradientTop: '#1e3a5f',
    gradientBottom: '#0f1e35',
    accentColor: '#60a5fa',
    label: 'Apartment',
    emoji: '🏢',
  },
  flat: {
    gradientTop: '#1e3a5f',
    gradientBottom: '#0f1e35',
    accentColor: '#60a5fa',
    label: 'Flat',
    emoji: '🏢',
  },
  villa: {
    gradientTop: '#5a2d0c',
    gradientBottom: '#3a1a06',
    accentColor: '#f59e0b',
    label: 'Villa',
    emoji: '🏡',
  },
  bungalow: {
    gradientTop: '#5a2d0c',
    gradientBottom: '#3a1a06',
    accentColor: '#f59e0b',
    label: 'Bungalow',
    emoji: '🏡',
  },
  rowhouse: {
    gradientTop: '#4a3728',
    gradientBottom: '#2a1f17',
    accentColor: '#d97706',
    label: 'Row House',
    emoji: '🏘️',
  },
  'row house': {
    gradientTop: '#4a3728',
    gradientBottom: '#2a1f17',
    accentColor: '#d97706',
    label: 'Row House',
    emoji: '🏘️',
  },
  shop: {
    gradientTop: '#1a2a5e',
    gradientBottom: '#0d1535',
    accentColor: '#818cf8',
    label: 'Shop',
    emoji: '🏪',
  },
  office: {
    gradientTop: '#1e293b',
    gradientBottom: '#0f172a',
    accentColor: '#94a3b8',
    label: 'Office',
    emoji: '🏬',
  },
  commercial: {
    gradientTop: '#1a2a5e',
    gradientBottom: '#0d1535',
    accentColor: '#818cf8',
    label: 'Commercial',
    emoji: '🏬',
  },
  warehouse: {
    gradientTop: '#374151',
    gradientBottom: '#1f2937',
    accentColor: '#9ca3af',
    label: 'Warehouse',
    emoji: '🏭',
  },
  penthouse: {
    gradientTop: '#1c1c3a',
    gradientBottom: '#0d0d1f',
    accentColor: '#c084fc',
    label: 'Penthouse',
    emoji: '🌆',
  },
  studio: {
    gradientTop: '#1e3a5f',
    gradientBottom: '#0f1e35',
    accentColor: '#38bdf8',
    label: 'Studio',
    emoji: '🏠',
  },
  default: {
    gradientTop: '#1e293b',
    gradientBottom: '#0f172a',
    accentColor: '#d4a853',
    label: 'Property',
    emoji: '🏠',
  },
};

function getConfig(propertyType?: string): FallbackConfig {
  if (!propertyType) return FALLBACK_CONFIGS.default;
  const key = propertyType.toLowerCase().trim();
  return FALLBACK_CONFIGS[key] ?? FALLBACK_CONFIGS.default;
}

/**
 * Generate a 1080x1350 fallback image for the given property type.
 * Returns a data URL string (image/png).
 */
export function generateFallbackImageDataUrl(propertyType?: string): string {
  const config = getConfig(propertyType);

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, config.gradientTop);
  gradient.addColorStop(1, config.gradientBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid pattern for texture
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Central glow circle
  const glowGradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 50,
    canvas.width / 2, canvas.height / 2, 400
  );
  glowGradient.addColorStop(0, `${config.accentColor}22`);
  glowGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Large emoji icon in center
  ctx.font = '220px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.emoji, canvas.width / 2, canvas.height / 2 - 80);

  // Property type label
  ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = config.accentColor;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(config.label, canvas.width / 2, canvas.height / 2 + 160);

  // Subtitle
  ctx.font = '40px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('No photo available', canvas.width / 2, canvas.height / 2 + 230);

  // Nivaara branding at bottom
  const brandY = canvas.height - 120;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, brandY - 40, canvas.width, 160);

  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#d4a853';
  ctx.fillText('Nivaara Realty Solutions', canvas.width / 2, brandY + 10);

  ctx.font = '32px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('"We Build Trust"', canvas.width / 2, brandY + 55);

  return canvas.toDataURL('image/png');
}

/**
 * Get a fallback image URL (data URL) for use in <img> tags.
 * Cached per property type to avoid regenerating on every render.
 */
const _cache: Record<string, string> = {};
export function getFallbackImageUrl(propertyType?: string): string {
  const key = (propertyType ?? 'default').toLowerCase().trim();
  if (!_cache[key]) {
    _cache[key] = generateFallbackImageDataUrl(propertyType);
  }
  return _cache[key];
}
