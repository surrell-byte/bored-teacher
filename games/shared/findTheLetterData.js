export const FIND_THE_LETTER_LEVELS = [
  ['Aa',['🍎 apple','🐜 ant','🐊 alligator','🪓 axe']], ['Bb',['🐝 bee','🍌 banana','🏀 ball','🎈 balloon']],
  ['Cc',['🐱 cat','🍰 cake','🚗 car','🐄 cow']], ['Dd',['🐶 dog','🦆 duck','🍩 donut','🥁 drum']],
  ['Ee',['🥚 egg','🐘 elephant','✉️ envelope','🧝 elf']], ['Ff',['🐟 fish','🐸 frog','🔥 fire','🌸 flower']],
  ['Gg',['🐐 goat','🍇 grapes','🎸 guitar','👻 ghost']], ['Hh',['🎩 hat','🏠 house','🐴 horse','🍔 hamburger']],
  ['Ii',['🐛 insect','🦎 iguana','🖋️ ink','🤒 ill']], ['Jj',['🪼 jellyfish','🧃 juice','🧥 jacket','🧩 jigsaw']],
  ['Kk',['🔑 key','🪁 kite','🤴 king','🦘 kangaroo']], ['Ll',['🦁 lion','🍃 leaf','🍋 lemon','💡 lamp']],
  ['Mm',['🌙 moon','🐵 monkey','🥛 milk','🐭 mouse']], ['Nn',['👃 nose','🪺 nest','🥅 net','🪡 needle']],
  ['Oo',['🐙 octopus','🍊 orange','🦦 otter','🐂 ox']], ['Pp',['🐷 pig','🍕 pizza','✏️ pencil','🐧 penguin']],
  ['Qq',['👸 queen','❓ question','🤫 quiet','🪶 quill']], ['Rr',['🐰 rabbit','🌈 rainbow','🚀 rocket','💍 ring']],
  ['Ss',['☀️ sun','🐍 snake','⭐ star','🧦 sock']], ['Tt',['🐯 tiger','🌳 tree','🚂 train','🐢 turtle']],
  ['Uu',['☂️ umbrella','⬆️ up','⬇️ under','🩲 underwear']], ['Vv',['🚐 van','🎻 violin','🌋 volcano','🧛 vampire']],
  ['Ww',['⌚ watch','💧 water','🐺 wolf','🍉 watermelon']], ['Xx',['🩻 x-ray','🦊 fox','📦 box','6️⃣ six']],
  ['Yy',['🪀 yoyo','🧶 yarn','💛 yellow','🥱 yawn']], ['Zz',['🦓 zebra','0️⃣ zero','⚡ zap','🤐 zipper']],
].map(([letter, entries]) => ({
  letter,
  cards: entries.map((entry) => {
    const splitAt = entry.indexOf(' ');
    return { emoji: entry.slice(0, splitAt), label: entry.slice(splitAt + 1) };
  }),
}));
