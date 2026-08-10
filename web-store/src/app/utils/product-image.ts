import { Product } from '../models/product.model';

const FALLBACKS: Array<{ pattern: RegExp; file: string }> = [
  { pattern: /sawdust|driftwood|wood/i, file: 'wood_cube_3.png' },
  { pattern: /rust|alloy|steel/i, file: 'metal_cube.png' },
  { pattern: /granite|marble|pillar/i, file: 'monument_cube_3.png' },
  { pattern: /quantum|holographic|processing|memory bank/i, file: 'technology_cube_1.png' },
  { pattern: /phoenix|magma|ember|pyro/i, file: 'volcano_cube_1.png' },
  { pattern: /obsidian|whisper/i, file: 'mythical_cube_4_V3.png' },
  { pattern: /neon|bubblegum|polymer/i, file: 'plastic_cube_4.png' },
  { pattern: /nebula|cosmic|aurora|stellar/i, file: 'space_cube_3.png' },
  { pattern: /frost|crystalline|tide|aquamarine/i, file: 'glass_cube_waves.png' },
];

export function getProductFallbackImage(product: Product): string {
  const context = `${product.title} ${product.category}`;
  const fallback = FALLBACKS.find(item => item.pattern.test(context))?.file || 'titanium_cube_mountain.png';
  const staticIndex = product.imagePath.indexOf('/static/');
  const origin = staticIndex >= 0 ? product.imagePath.slice(0, staticIndex) : window.location.origin;
  return `${origin}/static/${fallback}?v=20260809`;
}
