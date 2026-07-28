export type ShopItem = { id:string; type:'avatar'|'theme'|'effect'; name:string; icon:string; description:string; cost:number; addedAt:string; value:string };
export const SHOP_ITEMS: ShopItem[] = [
  { id:'avatar-astronaut', type:'avatar', name:'Astro Explorer', icon:'🧑‍🚀', description:'A cosmic avatar for bold explorers.', cost:90, addedAt:'2026-07-25', value:'🧑‍🚀' },
  { id:'theme-cobalt', type:'theme', name:'Cobalt Theme', icon:'🔵', description:'A deep-blue look for your hub.', cost:120, addedAt:'2026-07-22', value:'cobalt' },
  { id:'avatar-dragon', type:'avatar', name:'Sky Dragon', icon:'🐉', description:'A legendary companion for your profile.', cost:150, addedAt:'2026-07-18', value:'🐉' },
  { id:'theme-space', type:'theme', name:'Space Theme', icon:'🌌', description:'Turn your hub into a starry night.', cost:140, addedAt:'2026-07-14', value:'space' },
  { id:'effect-gold', type:'effect', name:'Gold Name Glow', icon:'✨', description:'A golden profile highlight.', cost:75, addedAt:'2026-07-10', value:'gold-glow' },
  { id:'avatar-unicorn', type:'avatar', name:'Rainbow Unicorn', icon:'🦄', description:'A magical profile avatar.', cost:110, addedAt:'2026-07-04', value:'🦄' },
];
export const LATEST_SHOP_ITEMS = [...SHOP_ITEMS].sort((a,b) => b.addedAt.localeCompare(a.addedAt)).slice(0,3);
