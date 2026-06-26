import { ThemeTokens } from './index';

// "Gold" maps to the original game's default amber/gold accent palette (the
// root :root tokens in the legacy build), used as the premium showcase theme.
const gold: ThemeTokens = {
  key: 'gold',
  bg: '#0A0B0E', panel: '#15171F', panelBorder: 'rgba(201,169,97,.16)',
  gold: '#C9A961', goldBright: '#E8C97A', goldDeep: '#8C6B33',
  ivory: '#F3EFE6', ivoryDim: '#9C9690',
  bgTop: 'rgba(201,169,97,.09)', bgDeep: '#111827', bgDeepEnd: '#07090f',
  vignette: 'rgba(212,175,55,.08)',
  boardBg: 'rgba(255,255,255,.02)', boardBorder: 'rgba(201,169,97,.14)',
};

export default gold;

