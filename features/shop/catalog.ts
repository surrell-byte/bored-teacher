export type ShopItem = { id:string; type:'avatar'|'theme'|'effect'; name:string; icon:string; description:string; cost:number; addedAt:string; value:string };
export const SHOP_ITEMS: ShopItem[] = [
  { id:'avatar-brax', type:'avatar', name:'Brax', icon:'🧑', description:'A bold new profile companion.', cost:85, addedAt:'2026-09-02', value:'/assets/images/avatars/brax-avatar.png' },
  { id:'avatar-brax-full-body', type:'avatar', name:'Brax Full Body', icon:'🧍', description:'Show off Brax from head to toe.', cost:105, addedAt:'2026-09-02', value:'/assets/images/avatars/brax-full-body-avatar.png' },
  { id:'avatar-cho', type:'avatar', name:'Cho', icon:'🌟', description:'A bright new look for your profile.', cost:90, addedAt:'2026-09-02', value:'/assets/images/avatars/cho-avatar.png' },
  { id:'avatar-parachuter-1', type:'avatar', name:'Parachuter One', icon:'🪂', description:'Drop into every game with style.', cost:95, addedAt:'2026-09-02', value:'/assets/images/avatars/parachuter-1.png' },
  { id:'avatar-parachuter-2', type:'avatar', name:'Parachuter Two', icon:'🪂', description:'A daring avatar for high flyers.', cost:95, addedAt:'2026-09-02', value:'/assets/images/avatars/parachuter-2.png' },
  { id:'avatar-parachuter-3', type:'avatar', name:'Parachuter Three', icon:'🪂', description:'Take the scenic route to your next win.', cost:100, addedAt:'2026-09-02', value:'/assets/images/avatars/parachuter-3.png' },
  { id:'avatar-parachuter-4', type:'avatar', name:'Parachuter Four', icon:'🪂', description:'A fearless profile pick.', cost:100, addedAt:'2026-09-02', value:'/assets/images/avatars/parachuter-4.png' },
  { id:'avatar-pterodactyl', type:'avatar', name:'Pterodactyl', icon:'🦖', description:'Prehistoric energy for your profile.', cost:125, addedAt:'2026-09-02', value:'/assets/images/avatars/pterodactyl-avatar.png' },
  { id:'avatar-rosie', type:'avatar', name:'Rosie', icon:'🌹', description:'A friendly face for your game hub.', cost:90, addedAt:'2026-09-02', value:'/assets/images/avatars/rosie-avatar.png' },
  { id:'avatar-tuk-tuk', type:'avatar', name:'Tuk Tuk', icon:'🛺', description:'Bring a little adventure to your profile.', cost:115, addedAt:'2026-09-02', value:'/assets/images/avatars/tuk-tuk-avatar.png' },
  { id:'avatar-astronaut', type:'avatar', name:'Astro Explorer', icon:'🧑‍🚀', description:'A cosmic avatar for bold explorers.', cost:90, addedAt:'2026-07-25', value:'🧑‍🚀' },
  { id:'theme-cobalt', type:'theme', name:'Cobalt Theme', icon:'🔵', description:'A deep-blue look for your hub.', cost:120, addedAt:'2026-07-22', value:'cobalt' },
  { id:'avatar-dragon', type:'avatar', name:'Sky Dragon', icon:'🐉', description:'A legendary companion for your profile.', cost:150, addedAt:'2026-07-18', value:'🐉' },
  { id:'theme-space', type:'theme', name:'Space Theme', icon:'🌌', description:'Turn your hub into a starry night.', cost:140, addedAt:'2026-07-14', value:'space' },
  { id:'effect-gold', type:'effect', name:'Gold Name Glow', icon:'✨', description:'A golden profile highlight.', cost:75, addedAt:'2026-07-10', value:'gold-glow' },
  { id:'avatar-unicorn', type:'avatar', name:'Rainbow Unicorn', icon:'🦄', description:'A magical profile avatar.', cost:110, addedAt:'2026-07-04', value:'🦄' },
];
export const LATEST_SHOP_ITEMS = [...SHOP_ITEMS].sort((a,b) => b.addedAt.localeCompare(a.addedAt)).slice(0,3);
