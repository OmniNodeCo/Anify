import { PresetAnimation } from '../types/animation';
import { blackHolePreset } from './blackHole';
import { cyberCityPreset } from './cyberCity';
import { neuralNetworkPreset } from './neuralNetwork';
import { particleVortexPreset } from './particleVortex';
import { tesseractPreset } from './tesseract4D';
import { kineticTextPreset } from './kineticText';
import { solarSystemPreset } from './solarSystem';
import { verletClothPreset } from './verletCloth';
import { jellyfishPreset } from './jellyfish';
import { audioReactivePreset } from './audioReactive';
import { metaballsPreset } from './metaballs';
import { sciFiHUDPreset } from './sciFiHUD';
import { lorenzPreset } from './lorenzAttractor';
import { matrixRainPreset } from './matrixRain';
import { origami3DPreset } from './origami3D';
import { reactionDiffusionPreset } from './reactionDiffusion';
import { cyberMechPreset } from './cyberMech3D';
import { ninjaParkourPreset } from './ninjaParkour3D';
import { puppetRunnerPreset } from './puppetRunner';

export const PRESETS: PresetAnimation[] = [
  blackHolePreset,
  cyberMechPreset,
  cyberCityPreset,
  ninjaParkourPreset,
  puppetRunnerPreset,
  neuralNetworkPreset,
  particleVortexPreset,
  tesseractPreset,
  kineticTextPreset,
  solarSystemPreset,
  verletClothPreset,
  jellyfishPreset,
  audioReactivePreset,
  metaballsPreset,
  sciFiHUDPreset,
  lorenzPreset,
  matrixRainPreset,
  origami3DPreset,
  reactionDiffusionPreset,
];

export function getPresetById(id: string): PresetAnimation | undefined {
  return PRESETS.find(p => p.id === id);
}

export const CATEGORIES = [
  'All',
  'Character & Rigging',
  'Cosmic & Physics',
  '3D & Shaders',
  'Motion Graphics',
  'Cyber & HUD',
  'Organic & Nature',
  'Math & Fractals',
] as const;
