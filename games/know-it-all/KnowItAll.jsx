import { useEffect, useRef, useState } from "react";
import { GameHelpText, useGameTranslation } from "@/engine/layout/GameTranslationContext";

const QUESTIONS = [
  { category: "Animals & Nature", q: "How many hearts does an octopus have?", options: ["One", "Two", "Three", "Four"], answer: 2, explanation: "Two hearts pump blood to the gills, while the third pumps blood to the rest of the body." },
  { category: "Animals & Nature", q: "What surprising visual skill can honeybees learn?", options: ["Recognise human face-like patterns", "Read printed words", "See in complete darkness", "Identify every colour humans can see"], answer: 0, explanation: "Honeybees can learn to distinguish face-like patterns, even though their brains are very small." },
  { category: "Animals & Nature", q: "Why are flamingos pink?", options: ["They are born that colour", "Their feathers contain pink ink", "They absorb colour from the sky", "Pigments in their food colour their feathers"], answer: 3, explanation: "Carotenoid pigments in the algae and tiny animals they eat give flamingos their pink colouring." },
  { category: "Animals & Nature", q: "Which animal is famous for producing cube-shaped droppings?", options: ["Koala", "Wombat", "Kangaroo", "Badger"], answer: 1, explanation: "The shape forms inside the wombat’s intestines and helps its territorial markings stay in place." },
  { category: "Animals & Nature", q: "Which animal is the fastest in a dive?", options: ["Cheetah", "Sailfish", "Peregrine falcon", "Ostrich"], answer: 2, explanation: "A peregrine falcon can exceed 300 km/h (186 mph) while diving to catch prey." },
  { category: "Space & the Universe", q: "Which planet has a rotation period longer than its year?", options: ["Mars", "Venus", "Jupiter", "Neptune"], answer: 1, explanation: "Venus takes about 243 Earth days to rotate once but about 225 Earth days to orbit the Sun." },
  { category: "Space & the Universe", q: "About how many Earth-sized spheres could fit inside the Sun by volume?", options: ["1,300", "13,000", "130,000", "1.3 million"], answer: 3, explanation: "The Sun is enormous: roughly 1.3 million Earth-sized spheres could fit inside it by volume." },
  { category: "Space & the Universe", q: "Why would Saturn theoretically float in water?", options: ["It is made entirely of gas", "Its average density is lower than water’s", "It has no gravity", "Its rings hold it up"], answer: 1, explanation: "Saturn’s average density is lower than water’s, though there is no practical ocean large enough to float it in." },
  { category: "Space & the Universe", q: "How long does sunlight take to reach Earth?", options: ["About 8 seconds", "About 8 minutes and 20 seconds", "About 8 hours", "About 8 days"], answer: 1, explanation: "Sunlight travels at a finite speed, so it takes about 8 minutes and 20 seconds to get here." },
  { category: "Space & the Universe", q: "What is the name of the Solar System’s tallest known volcano?", options: ["Mount Everest", "Mauna Loa", "Olympus Mons", "Elysium Peak"], answer: 2, explanation: "Olympus Mons on Mars is about 22 km (14 miles) tall, measured from its surrounding terrain." },
  { category: "Science & the Human Body", q: "How hot can a lightning channel become?", options: ["About 300°C", "About 3,000°C", "About 30,000°C", "About 300,000°C"], answer: 2, explanation: "A lightning channel can reach around 30,000°C—hotter than the Sun’s visible surface, which is about 5,500°C." },
  { category: "Science & the Human Body", q: "What does DNA carry?", options: ["Genetic instructions", "Oxygen in the blood", "Food through the stomach", "Electrical power for muscles"], answer: 0, explanation: "DNA stores genetic instructions that help determine how an organism develops and functions. Mature red blood cells are a notable exception to the usual cell-DNA rule." },
  { category: "Science & the Human Body", q: "Which set lists three states in which water naturally occurs on Earth?", options: ["Metal, rock and gas", "Ice, liquid water and water vapour", "Steam, fire and ice", "Cloud, rain and snow only"], answer: 1, explanation: "Water occurs as a solid (ice), liquid (water) and gas (water vapour)." },
  { category: "Science & the Human Body", q: "What is the largest animal known to have lived on Earth?", options: ["African elephant", "Megalodon", "Blue whale", "Giant squid"], answer: 2, explanation: "Blue whales can reach around 30 metres (98 feet) in length and are the largest known animals." },
  { category: "Science & the Human Body", q: "Why do onions make your eyes water when you cut them?", options: ["They release an irritating chemical gas", "They absorb moisture from your eyes", "Their colour reflects bright light", "They make the air colder"], answer: 0, explanation: "Cutting onion cells releases compounds that react to form an irritating gas, triggering tears." },
  { category: "Geography & Earth", q: "What is the world’s largest desert?", options: ["The Sahara", "The Gobi", "Antarctica", "The Arabian Desert"], answer: 2, explanation: "Deserts are defined by low precipitation, not by heat. Antarctica is the largest desert and the coldest continent." },
  { category: "Geography & Earth", q: "Into which body of water does the Nile River flow?", options: ["Indian Ocean", "Mediterranean Sea", "Red Sea", "Atlantic Ocean"], answer: 1, explanation: "The Nile flows north through northeastern Africa and empties into the Mediterranean Sea." },
  { category: "Geography & Earth", q: "Where is Lake Baikal, one of the world’s deepest freshwater lakes?", options: ["Canada", "Russia", "Brazil", "India"], answer: 1, explanation: "Lake Baikal is in Russia. It is about 1,642 metres deep and contains roughly one-fifth of the world’s unfrozen surface freshwater." },
  { category: "Geography & Earth", q: "Which mountain is highest above sea level?", options: ["K2", "Kilimanjaro", "Mount Everest", "Denali"], answer: 2, explanation: "Mount Everest’s officially recognised height is 8,848.86 metres (29,031.7 feet) above sea level." },
  { category: "Geography & Earth", q: "Which is the largest hot desert on Earth?", options: ["The Sahara", "The Mojave", "The Kalahari", "The Great Victoria Desert"], answer: 0, explanation: "The Sahara covers much of North Africa and is roughly comparable in area to the United States." },
  { category: "History & Inventions", q: "Cleopatra lived closer in time to which event?", options: ["The building of the Great Pyramid", "The first Moon landing", "The invention of the wheel", "The start of ancient Egypt"], answer: 1, explanation: "Cleopatra died in 30 BCE; the Great Pyramid was built around 2560 BCE, while humans landed on the Moon in 1969." },
  { category: "History & Inventions", q: "Around what year did Rome’s Colosseum open?", options: ["80 CE", "500 BCE", "1066 CE", "1492 CE"], answer: 0, explanation: "The Colosseum opened around 80 CE and hosted public spectacles in ancient Rome." },
  { category: "History & Inventions", q: "Who is strongly associated with the spread of movable-type printing in 15th-century Europe?", options: ["Leonardo da Vinci", "Johannes Gutenberg", "Isaac Newton", "Marco Polo"], answer: 1, explanation: "Johannes Gutenberg’s printing system helped books be reproduced more efficiently in Europe." },
  { category: "History & Inventions", q: "What is the core of an ordinary pencil mainly made from?", options: ["Lead", "Graphite and clay", "Charcoal and wax", "Iron and carbon"], answer: 1, explanation: "Pencil cores are mainly graphite mixed with clay. The name ‘lead pencil’ comes from an old misunderstanding about graphite." },
  { category: "History & Inventions", q: "Which statement about fruit is botanically correct?", options: ["Strawberries are true berries, bananas are not", "Both strawberries and bananas are true berries", "Bananas are berries, but strawberries are not true berries", "Neither fruit grows from a flower"], answer: 2, explanation: "Botanically, bananas are berries, while strawberries are not true berries. Classification depends on how a fruit develops from a flower." },
];

function shuffle(values) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }
  return shuffled;
}

function createOptionOrders() {
  const correctSlots = shuffle(Array.from({ length: QUESTIONS.length }, (_, index) => index % 4));
  return QUESTIONS.map((question, questionIndex) => {
    const correctSlot = correctSlots[questionIndex];
    const otherOptions = shuffle(question.options.map((_, optionIndex) => optionIndex).filter(optionIndex => optionIndex !== question.answer));
    const order = [];
    let otherOptionIndex = 0;
    for (let slot = 0; slot < question.options.length; slot += 1) {
      order.push(slot === correctSlot ? question.answer : otherOptions[otherOptionIndex++]);
    }
    return order;
  });
}

const QUESTION_VISUALS = [
  { question: { src: "/assets/games/know-it-all/octopus.webp", alt: "An octopus swimming underwater" }, answer: { src: "/assets/games/know-it-all/octopus.webp", alt: "An octopus swimming underwater" } },
  { question: { src: "/assets/games/know-it-all/honeybee-question.webp", alt: "A honeybee gathering nectar from a flower" }, answer: { src: "/assets/games/know-it-all/honeybee-answer.webp", alt: "Honeybees gathering around a flower" } },
  { question: { src: "/assets/games/know-it-all/flamingo-question.webp", alt: "Flamingos with bright pink plumage" }, answer: { src: "/assets/games/know-it-all/flamingo-answer.webp", alt: "Flamingos feeding in shallow water" } },
  { question: { src: "/assets/games/know-it-all/wombat.webp", alt: "A wombat standing on grass" }, answer: { src: "/assets/games/know-it-all/wombat-answer.webp", alt: "A wombat in its natural habitat" } },
  { question: { src: "/assets/games/know-it-all/dive-question.webp", alt: "A person diving from a platform into water" }, answer: { src: "/assets/games/know-it-all/dive-answer.webp", alt: "A peregrine falcon diving through the sky" } },
  { question: { src: "/assets/games/know-it-all/planets-question.webp", alt: "Planets in the Solar System" }, answer: { src: "/assets/games/know-it-all/planets-question.webp", alt: "Planets in the Solar System" } },
  { question: { src: "/assets/games/know-it-all/earth-spheres-question.webp", alt: "A comparison showing how many Earth-sized spheres fit inside the Sun" }, answer: { src: "/assets/games/know-it-all/earth-spheres-question.webp", alt: "A comparison showing how many Earth-sized spheres fit inside the Sun" } },
  { question: { src: "/assets/games/know-it-all/saturn-question.webp", alt: "Saturn depicted floating in water" }, answer: { src: "/assets/games/know-it-all/saturn-answer.webp", alt: "Saturn shown with its rings" } },
  { question: { src: "/assets/games/know-it-all/sun-earth.webp", alt: "The Sun and Earth shown side by side" }, answer: { src: "/assets/games/know-it-all/sun-earth.webp", alt: "The Sun and Earth shown side by side" } },
  { question: { src: "/assets/games/know-it-all/olympus-mons-question.webp", alt: "Olympus Mons rising above the surface of Mars" }, answer: { src: "/assets/games/know-it-all/olympus-mons-answer.webp", alt: "A view of Olympus Mons on Mars" } },
  { question: { src: "/assets/games/know-it-all/lightning-question.webp", alt: "A lightning bolt illuminating the sky" }, answer: { src: "/assets/games/know-it-all/lightning-answer.webp", alt: "A close view of a lightning strike" } },
  { question: { src: "/assets/games/know-it-all/dna-question.webp", alt: "A glowing DNA double helix" }, answer: { src: "/assets/games/know-it-all/dna-answer.webp", alt: "A diagram of the DNA double helix" } },
  { question: { src: "/assets/games/know-it-all/states-of-water-question.webp", alt: "Water shown in its solid, liquid, and gas states" }, answer: { src: "/assets/games/know-it-all/states-of-water-answer.webp", alt: "A diagram of water changing between three states" } },
  { question: { src: "/assets/games/know-it-all/blue-whale-question.webp", alt: "A blue whale swimming underwater" }, answer: { src: "/assets/games/know-it-all/blue-whale-answer.webp", alt: "A blue whale shown beside a diver" } },
  { question: { src: "/assets/games/know-it-all/onions-question.webp", alt: "A selection of whole and cut onions" }, answer: { src: "/assets/games/know-it-all/onions-answer.webp", alt: "Onions being prepared for cooking" } },
  { question: { src: "/assets/games/know-it-all/antarctic-desert-question.webp", alt: "A camel caravan crossing a desert" }, answer: { src: "/assets/games/know-it-all/antarctic-desert-answer.webp", alt: "A vast snowy landscape in Antarctica" } },
  { question: { src: "/assets/games/know-it-all/nile-question.webp", alt: "The Nile River flowing through Egypt" }, answer: { src: "/assets/games/know-it-all/nile-answer.webp", alt: "A map tracing the Nile through Egypt" } },
  { question: { src: "/assets/games/know-it-all/lake-baikal-question.webp", alt: "Lake Baikal surrounded by mountains" }, answer: { src: "/assets/games/know-it-all/lake-baikal-answer.webp", alt: "Lake Baikal beneath a winter landscape" } },
  { question: { src: "/assets/games/know-it-all/everest-question.webp", alt: "Climbers ascending Mount Everest" }, answer: { src: "/assets/games/know-it-all/everest-answer.webp", alt: "Mount Everest rising above surrounding peaks" } },
  { question: { src: "/assets/games/know-it-all/sahara.webp", alt: "A camel caravan crossing the Sahara Desert" }, answer: { src: "/assets/games/know-it-all/sahara-answer.webp", alt: "The sandy dunes of the Sahara Desert" } },
  { question: { src: "/assets/games/know-it-all/cleopatra-question.webp", alt: "An artistic portrait of Cleopatra" }, answer: { src: "/assets/games/know-it-all/moon-landing-answer.webp", alt: "An astronaut standing on the Moon" } },
  { question: { src: "/assets/games/know-it-all/colosseum-question.webp", alt: "The Colosseum in Rome" }, answer: { src: "/assets/games/know-it-all/colosseum-answer.webp", alt: "The Colosseum illuminated at sunset" } },
  { question: { src: "/assets/games/know-it-all/movable-type-printing.webp", alt: "A historical illustration of a movable-type printing press" }, answer: { src: "/assets/games/know-it-all/movable-type-printing-answer.webp", alt: "A historical illustration of Gutenberg's printing press" } },
  { question: { src: "/assets/games/know-it-all/pencil-question.webp", alt: "Pencils being held in different grips" }, answer: { src: "/assets/games/know-it-all/pencil-answer.webp", alt: "A close view of a pencil and its graphite core" } },
  { question: { src: "/assets/games/know-it-all/fruit-question.webp", alt: "A colourful assortment of fruit" }, answer: { src: "/assets/games/know-it-all/fruit-answer.webp", alt: "A selection of fruit including bananas and strawberries" } },
];

const QUESTION_TRANSLATIONS = [
  { question: "章鱼有几颗心脏？", options: ["一颗", "两颗", "三颗", "四颗"], explanation: "两颗心脏将血液泵向鳃，第三颗心脏则将血液泵向身体其他部位。" },
  { question: "蜜蜂能学会哪种令人惊讶的视觉技能？", options: ["辨认类似人脸的图案", "阅读印刷文字", "在完全黑暗中看见东西", "辨认人类能看到的所有颜色"], explanation: "尽管大脑很小，蜜蜂仍能学会区分类似人脸的图案。" },
  { question: "火烈鸟为什么是粉红色的？", options: ["它们天生就是这个颜色", "它们的羽毛含有粉红色墨水", "它们吸收了天空的颜色", "食物中的色素使它们的羽毛变成粉红色"], explanation: "火烈鸟吃的藻类和小动物中的类胡萝卜素色素，会让它们的羽毛呈现粉红色。" },
  { question: "哪种动物以排出立方体形状的粪便而闻名？", options: ["考拉", "袋熊", "袋鼠", "獾"], explanation: "这种形状在袋熊的肠道内形成，有助于它留下的领地标记不易滚动移位。" },
  { question: "哪种动物以俯冲速度最快而闻名？", options: ["猎豹", "旗鱼", "游隼", "鸵鸟"], explanation: "游隼俯冲捕猎时的速度可超过每小时300公里（186英里）。" },
  { question: "哪颗行星自转一周的时间比它绕太阳一周还长？", options: ["火星", "金星", "木星", "海王星"], explanation: "金星自转一周约需243个地球日，但绕太阳一周约需225个地球日。" },
  { question: "按体积计算，太阳里大约能装下多少个地球大小的球体？", options: ["1,300个", "13,000个", "130,000个", "130万个"], explanation: "太阳非常巨大，按体积计算，大约能装下130万个地球大小的球体。" },
  { question: "为什么从理论上说土星可以浮在水上？", options: ["它完全由气体组成", "它的平均密度比水低", "它没有引力", "它的光环能托住它"], explanation: "土星的平均密度比水低，不过现实中并不存在足够大的海洋让土星漂浮。" },
  { question: "阳光到达地球大约需要多长时间？", options: ["约8秒", "约8分20秒", "约8小时", "约8天"], explanation: "光的传播速度有限，因此阳光到达地球大约需要8分20秒。" },
  { question: "太阳系中已知最高的火山叫什么？", options: ["珠穆朗玛峰", "莫纳罗亚火山", "奥林帕斯山", "埃律西昂峰"], explanation: "火星上的奥林帕斯山从周围地形算起约高22公里（14英里）。" },
  { question: "闪电通道的温度最高可达到多少？", options: ["约300°C", "约3,000°C", "约30,000°C", "约300,000°C"], explanation: "闪电通道的温度可达约30,000°C，比太阳可见表面约5,500°C的温度还高。" },
  { question: "DNA携带什么？", options: ["遗传指令", "血液中的氧气", "通过胃部运输的食物", "为肌肉提供的电能"], explanation: "DNA储存遗传指令，帮助决定生物如何发育和运作。成熟的红细胞是通常细胞含有DNA这一规律的一个例外。" },
  { question: "下面哪一组选出了水在地球上自然存在的三种状态？", options: ["金属、岩石和气体", "冰、液态水和水蒸气", "蒸汽、火和冰", "只有云、雨和雪"], explanation: "水可以以固态（冰）、液态（水）和气态（水蒸气）存在。" },
  { question: "已知曾在地球上生活过的最大动物是什么？", options: ["非洲象", "巨齿鲨", "蓝鲸", "大王乌贼"], explanation: "蓝鲸体长可达约30米（98英尺），是已知最大的动物。" },
  { question: "为什么切洋葱时会让眼睛流泪？", options: ["洋葱会释放刺激性气体", "洋葱会吸走眼睛里的水分", "洋葱的颜色会反射强光", "洋葱会让空气变冷"], explanation: "切开洋葱细胞后，释放出的化合物会反应形成刺激性气体，引发流泪。" },
  { question: "世界上面积最大的沙漠是什么？", options: ["撒哈拉沙漠", "戈壁沙漠", "南极洲", "阿拉伯沙漠"], explanation: "沙漠以降水少来定义，而不是以炎热来定义。南极洲是面积最大的沙漠，也是最寒冷的大陆。" },
  { question: "尼罗河流入哪片水域？", options: ["印度洋", "地中海", "红海", "大西洋"], explanation: "尼罗河向北流经非洲东北部，最终注入地中海。" },
  { question: "贝加尔湖是世界上最深的淡水湖之一，它位于哪里？", options: ["加拿大", "俄罗斯", "巴西", "印度"], explanation: "贝加尔湖位于俄罗斯，深约1,642米，储存着全球约五分之一未冻结的地表淡水。" },
  { question: "哪座山的海拔最高？", options: ["乔戈里峰（K2）", "乞力马扎罗山", "珠穆朗玛峰", "迪纳利山"], explanation: "珠穆朗玛峰官方认可的海拔高度为8,848.86米（29,031.7英尺）。" },
  { question: "地球上面积最大的热沙漠是哪一个？", options: ["撒哈拉沙漠", "莫哈韦沙漠", "卡拉哈里沙漠", "大维多利亚沙漠"], explanation: "撒哈拉沙漠覆盖北非的大部分地区，面积大约与美国相当。" },
  { question: "克娄巴特拉生活的年代离哪件事更近？", options: ["大金字塔的建造", "人类首次登月", "车轮的发明", "古埃及文明的开端"], explanation: "克娄巴特拉于公元前30年去世；大金字塔约建于公元前2560年，而人类于1969年登月。" },
  { question: "罗马斗兽场大约在哪一年开放？", options: ["公元80年", "公元前500年", "公元1066年", "公元1492年"], explanation: "罗马斗兽场大约在公元80年开放，曾举办古罗马公共表演。" },
  { question: "谁与15世纪活字印刷术在欧洲的传播关系最密切？", options: ["列奥纳多·达·芬奇", "约翰内斯·古腾堡", "艾萨克·牛顿", "马可·波罗"], explanation: "约翰内斯·古腾堡的印刷系统帮助欧洲更有效地复制书籍。" },
  { question: "普通铅笔的笔芯主要由什么制成？", options: ["铅", "石墨和黏土", "木炭和蜡", "铁和碳"], explanation: "铅笔芯主要由石墨和黏土混合制成。“铅笔”这个名称源于过去人们误以为石墨是铅。" },
  { question: "下面哪种关于水果的说法符合植物学定义？", options: ["草莓是真浆果，香蕉不是", "草莓和香蕉都是真浆果", "香蕉是浆果，但草莓不是真浆果", "这两种水果都不是由花发育而来"], explanation: "从植物学角度看，香蕉是浆果，而草莓不是真浆果。分类取决于果实如何从花发育而来。" },
];

const THAI_QUESTION_TRANSLATIONS = [
  { question: "ปลาหมึกยักษ์มีหัวใจกี่ดวง?", options: ["หนึ่งดวง", "สองดวง", "สามดวง", "สี่ดวง"], explanation: "หัวใจสองดวงสูบฉีดเลือดไปยังเหงือก ส่วนหัวใจดวงที่สามสูบฉีดเลือดไปยังส่วนอื่น ๆ ของร่างกาย" },
  { question: "ผึ้งสามารถเรียนรู้ทักษะการมองเห็นที่น่าทึ่งข้อใด?", options: ["จดจำรูปแบบที่คล้ายใบหน้ามนุษย์", "อ่านตัวอักษรที่พิมพ์ไว้", "มองเห็นได้ในความมืดสนิท", "แยกแยะสีได้ทุกสีที่มนุษย์มองเห็น"], explanation: "แม้สมองจะมีขนาดเล็ก ผึ้งก็สามารถเรียนรู้ที่จะแยกแยะรูปแบบที่คล้ายใบหน้าได้" },
  { question: "ทำไมฟลามิงโกจึงมีสีชมพู?", options: ["พวกมันเกิดมามีสีนี้", "ขนของพวกมันมีหมึกสีชมพู", "พวกมันดูดซับสีจากท้องฟ้า", "รงควัตถุในอาหารทำให้ขนเป็นสีชมพู"], explanation: "รงควัตถุแคโรทีนอยด์ในสาหร่ายและสัตว์ตัวเล็ก ๆ ที่ฟลามิงโกกิน ทำให้ขนของพวกมันมีสีชมพู" },
  { question: "สัตว์ชนิดใดขึ้นชื่อเรื่องการถ่ายมูลเป็นรูปลูกบาศก์?", options: ["โคอาลา", "วอมแบต", "จิงโจ้", "แบดเจอร์"], explanation: "รูปร่างนี้ก่อตัวขึ้นภายในลำไส้ของวอมแบต และช่วยให้เครื่องหมายอาณาเขตที่มันทิ้งไว้ไม่กลิ้งหายไป" },
  { question: "สัตว์ชนิดใดขึ้นชื่อว่าดิ่งตัวได้เร็วที่สุด?", options: ["เสือชีตาห์", "ปลากระโทงดาบ", "เหยี่ยวเพเรกริน", "นกกระจอกเทศ"], explanation: "เหยี่ยวเพเรกรินอาจดิ่งตัวด้วยความเร็วมากกว่า 300 กิโลเมตรต่อชั่วโมง (186 ไมล์ต่อชั่วโมง) เพื่อจับเหยื่อ" },
  { question: "ดาวเคราะห์ดวงใดใช้เวลาหมุนรอบตัวเองนานกว่าการโคจรรอบดวงอาทิตย์หนึ่งรอบ?", options: ["ดาวอังคาร", "ดาวศุกร์", "ดาวพฤหัสบดี", "ดาวเนปจูน"], explanation: "ดาวศุกร์ใช้เวลาหมุนรอบตัวเองประมาณ 243 วันโลก แต่ใช้เวลาโคจรรอบดวงอาทิตย์ประมาณ 225 วันโลก" },
  { question: "หากเทียบตามปริมาตร ดวงอาทิตย์จุทรงกลมขนาดเท่าโลกได้ประมาณกี่ลูก?", options: ["1,300 ลูก", "13,000 ลูก", "130,000 ลูก", "1.3 ล้านลูก"], explanation: "ดวงอาทิตย์มีขนาดใหญ่มาก หากเทียบตามปริมาตรจะจุทรงกลมขนาดเท่าโลกได้ประมาณ 1.3 ล้านลูก" },
  { question: "เหตุใดดาวเสาร์จึงอาจลอยน้ำได้ในทางทฤษฎี?", options: ["ดาวเสาร์ประกอบด้วยแก๊สทั้งหมด", "ความหนาแน่นเฉลี่ยต่ำกว่าน้ำ", "ดาวเสาร์ไม่มีแรงโน้มถ่วง", "วงแหวนช่วยพยุงดาวไว้"], explanation: "ความหนาแน่นเฉลี่ยของดาวเสาร์ต่ำกว่าน้ำ แต่ในความเป็นจริงไม่มีมหาสมุทรที่ใหญ่พอให้ดาวเสาร์ลอยได้" },
  { question: "แสงอาทิตย์ใช้เวลาเดินทางมายังโลกประมาณเท่าไร?", options: ["ประมาณ 8 วินาที", "ประมาณ 8 นาที 20 วินาที", "ประมาณ 8 ชั่วโมง", "ประมาณ 8 วัน"], explanation: "แสงเดินทางด้วยความเร็วที่มีขีดจำกัด จึงใช้เวลาประมาณ 8 นาที 20 วินาทีกว่าจะมาถึงโลก" },
  { question: "ภูเขาไฟที่สูงที่สุดเท่าที่รู้จักในระบบสุริยะมีชื่อว่าอะไร?", options: ["ยอดเขาเอเวอเรสต์", "ภูเขาไฟเมานาโลอา", "ภูเขาโอลิมปัสมอนส์", "ยอดเขาเอลิเซียม"], explanation: "โอลิมปัสมอนส์บนดาวอังคารสูงประมาณ 22 กิโลเมตร (14 ไมล์) เมื่อวัดจากภูมิประเทศโดยรอบ" },
  { question: "ช่องสายฟ้าแลบอาจมีอุณหภูมิสูงถึงเท่าไร?", options: ["ประมาณ 300°C", "ประมาณ 3,000°C", "ประมาณ 30,000°C", "ประมาณ 300,000°C"], explanation: "ช่องสายฟ้าแลบอาจมีอุณหภูมิประมาณ 30,000°C ซึ่งร้อนกว่าพื้นผิวที่มองเห็นได้ของดวงอาทิตย์ซึ่งมีอุณหภูมิประมาณ 5,500°C" },
  { question: "DNA ทำหน้าที่เก็บข้อมูลอะไร?", options: ["คำสั่งทางพันธุกรรม", "ออกซิเจนในเลือด", "อาหารที่เคลื่อนผ่านกระเพาะ", "พลังงานไฟฟ้าสำหรับกล้ามเนื้อ"], explanation: "DNA เก็บคำสั่งทางพันธุกรรมที่ช่วยกำหนดการเจริญเติบโตและการทำงานของสิ่งมีชีวิต เม็ดเลือดแดงที่เจริญเต็มที่เป็นข้อยกเว้นของกฎทั่วไปที่ว่าเซลล์มี DNA" },
  { question: "ข้อใดระบุสถานะทั้งสามแบบที่น้ำพบได้ตามธรรมชาติบนโลก?", options: ["โลหะ หิน และแก๊ส", "น้ำแข็ง น้ำสถานะของเหลว และไอน้ำ", "ไอน้ำ ไฟ และน้ำแข็ง", "มีเพียงเมฆ ฝน และหิมะ"], explanation: "น้ำพบได้ในสถานะของแข็ง (น้ำแข็ง) ของเหลว (น้ำ) และแก๊ส (ไอน้ำ)" },
  { question: "สัตว์ที่ใหญ่ที่สุดเท่าที่เคยมีชีวิตอยู่บนโลกคืออะไร?", options: ["ช้างแอฟริกา", "เมกาโลดอน", "วาฬสีน้ำเงิน", "หมึกยักษ์"], explanation: "วาฬสีน้ำเงินอาจมีความยาวประมาณ 30 เมตร (98 ฟุต) และเป็นสัตว์ที่ใหญ่ที่สุดเท่าที่รู้จัก" },
  { question: "ทำไมหั่นหัวหอมแล้วน้ำตาจึงไหล?", options: ["หัวหอมปล่อยก๊าซที่ทำให้ระคายเคือง", "หัวหอมดูดความชื้นจากดวงตา", "สีของหัวหอมสะท้อนแสงจ้า", "หัวหอมทำให้อากาศเย็นลง"], explanation: "เมื่อเซลล์ของหัวหอมถูกตัด สารประกอบที่ปล่อยออกมาจะทำปฏิกิริยาจนเกิดก๊าซระคายเคืองและกระตุ้นให้น้ำตาไหล" },
  { question: "ทะเลทรายที่มีพื้นที่ใหญ่ที่สุดในโลกคือที่ใด?", options: ["ทะเลทรายซาฮารา", "ทะเลทรายโกบี", "ทวีปแอนตาร์กติกา", "ทะเลทรายอาหรับ"], explanation: "ทะเลทรายนิยามจากปริมาณฝนที่น้อย ไม่ใช่ความร้อน แอนตาร์กติกาเป็นทะเลทรายที่ใหญ่ที่สุดและเป็นทวีปที่หนาวที่สุด" },
  { question: "แม่น้ำไนล์ไหลลงสู่แหล่งน้ำใด?", options: ["มหาสมุทรอินเดีย", "ทะเลเมดิเตอร์เรเนียน", "ทะเลแดง", "มหาสมุทรแอตแลนติก"], explanation: "แม่น้ำไนล์ไหลไปทางเหนือผ่านแอฟริกาตะวันออกเฉียงเหนือและไหลลงสู่ทะเลเมดิเตอร์เรเนียน" },
  { question: "ทะเลสาบไบคาล หนึ่งในทะเลสาบน้ำจืดที่ลึกที่สุดในโลก อยู่ที่ใด?", options: ["แคนาดา", "รัสเซีย", "บราซิล", "อินเดีย"], explanation: "ทะเลสาบไบคาลอยู่ในรัสเซีย ลึกประมาณ 1,642 เมตร และมีน้ำจืดผิวดินที่ยังไม่กลายเป็นน้ำแข็งประมาณหนึ่งในห้าของโลก" },
  { question: "ภูเขาลูกใดมีความสูงเหนือระดับน้ำทะเลมากที่สุด?", options: ["เคทู (K2)", "คิลิมันจาโร", "ยอดเขาเอเวอเรสต์", "เดนาลี"], explanation: "ความสูงที่ได้รับการรับรองอย่างเป็นทางการของยอดเขาเอเวอเรสต์คือ 8,848.86 เมตร (29,031.7 ฟุต) เหนือระดับน้ำทะเล" },
  { question: "ทะเลทรายร้อนที่ใหญ่ที่สุดในโลกคือที่ใด?", options: ["ทะเลทรายซาฮารา", "ทะเลทรายโมฮาวี", "ทะเลทรายคาลาฮารี", "ทะเลทรายเกรตวิกตอเรีย"], explanation: "ทะเลทรายซาฮาราครอบคลุมพื้นที่ส่วนใหญ่ของแอฟริกาเหนือ และมีพื้นที่ใกล้เคียงกับประเทศสหรัฐอเมริกา" },
  { question: "คลีโอพัตราอยู่ใกล้กับเหตุการณ์ใดมากกว่าเมื่อเทียบตามเวลา?", options: ["การสร้างมหาพีระมิด", "การลงจอดบนดวงจันทร์ครั้งแรก", "การประดิษฐ์วงล้อ", "จุดเริ่มต้นของอียิปต์โบราณ"], explanation: "คลีโอพัตราเสียชีวิตในปี 30 ก่อนคริสตกาล มหาพีระมิดสร้างขึ้นราว 2560 ปีก่อนคริสตกาล ส่วนมนุษย์ลงจอดบนดวงจันทร์ในปี 1969" },
  { question: "โคลอสเซียมแห่งกรุงโรมเปิดใช้งานประมาณปีใด?", options: ["ค.ศ. 80", "500 ปีก่อนคริสตกาล", "ค.ศ. 1066", "ค.ศ. 1492"], explanation: "โคลอสเซียมเปิดใช้งานประมาณ ค.ศ. 80 และเคยใช้จัดการแสดงสาธารณะในกรุงโรมโบราณ" },
  { question: "ใครมีความเกี่ยวข้องอย่างมากกับการเผยแพร่แท่นพิมพ์ตัวเรียงในยุโรปช่วงคริสต์ศตวรรษที่ 15?", options: ["เลโอนาร์โด ดา วินชี", "โยฮันเนส กูเทนแบร์ก", "ไอแซก นิวตัน", "มาร์โค โปโล"], explanation: "ระบบการพิมพ์ของโยฮันเนส กูเทนแบร์กช่วยให้ทำสำเนาหนังสือในยุโรปได้อย่างมีประสิทธิภาพมากขึ้น" },
  { question: "ไส้ดินสอทั่วไปทำจากอะไรเป็นหลัก?", options: ["ตะกั่ว", "แกรไฟต์และดินเหนียว", "ถ่านและขี้ผึ้ง", "เหล็กและคาร์บอน"], explanation: "ไส้ดินสอส่วนใหญ่ทำจากแกรไฟต์ผสมดินเหนียว คำว่า “ดินสอไส้ตะกั่ว” มาจากความเข้าใจผิดในอดีตว่าแกรไฟต์คือตะกั่ว" },
  { question: "ข้อใดเกี่ยวกับผลไม้ถูกต้องตามหลักพฤกษศาสตร์?", options: ["สตรอว์เบอร์รีเป็นเบอร์รีแท้ แต่กล้วยไม่ใช่", "ทั้งสตรอว์เบอร์รีและกล้วยเป็นเบอร์รีแท้", "กล้วยเป็นเบอร์รี แต่สตรอว์เบอร์รีไม่ใช่เบอร์รีแท้", "ผลไม้ทั้งสองชนิดไม่ได้เติบโตมาจากดอก"], explanation: "ตามหลักพฤกษศาสตร์ กล้วยเป็นเบอร์รี แต่สตรอว์เบอร์รีไม่ใช่เบอร์รีแท้ การจำแนกขึ้นอยู่กับวิธีที่ผลพัฒนามาจากดอก" },
];

const CATEGORY_TRANSLATIONS = {
  "Animals & Nature": "动物与自然",
  "Space & the Universe": "太空与宇宙",
  "Science & the Human Body": "科学与人体",
  "Geography & Earth": "地理与地球",
  "History & Inventions": "历史与发明",
};

const THAI_CATEGORY_TRANSLATIONS = {
  "Animals & Nature": "สัตว์และธรรมชาติ",
  "Space & the Universe": "อวกาศและจักรวาล",
  "Science & the Human Body": "วิทยาศาสตร์และร่างกายมนุษย์",
  "Geography & Earth": "ภูมิศาสตร์และโลก",
  "History & Inventions": "ประวัติศาสตร์และสิ่งประดิษฐ์",
};

const LETTERS = ["A", "B", "C", "D"];

function getResultCopy(pct) {
  if (pct >= 90) {
    return {
      emoji: "🏆",
      title: "Outstanding knowledge!",
      message: "You absolutely smashed this quiz with a brilliant score. You really know your stuff!",
    };
  }
  if (pct >= 75) {
    return {
      emoji: "🌟",
      title: "Fantastic work!",
      message: "A superb effort. You have an excellent grasp of the big facts and curious details.",
    };
  }
  if (pct >= 50) {
    return {
      emoji: "👍",
      title: "Great effort!",
      message: "You’ve built a solid base of knowledge. A bit more practice and you’ll be unstoppable.",
    };
  }
  if (pct >= 25) {
    return {
      emoji: "💡",
      title: "Nice progress!",
      message: "You learned a lot along the way. Every correct answer is a step toward bigger brain power.",
    };
  }
  return {
    emoji: "🚀",
    title: "Keep exploring!",
    message: "You’re just getting started. Try again and watch your confidence grow with each round.",
  };
}

export default function KnowItAll({ onComplete, profileName = "" }) {
  const [screen, setScreen] = useState("player-info");
  const [playerName, setPlayerName] = useState(profileName || "Player 1");
  const [optionOrders, setOptionOrders] = useState(createOptionOrders);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [responses, setResponses] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [score, setScore] = useState(0);
  const reviewRef = useRef(null);
  const { language: helpLanguage } = useGameTranslation();

  const item = QUESTIONS[current];
  const selectedOption = selected === null ? null : optionOrders[current][selected];
  const total = QUESTIONS.length;
  const isCorrect = answered && selectedOption === item.answer;
  const showHelp = helpLanguage !== "off";
  const translations = helpLanguage === "th" ? THAI_QUESTION_TRANSLATIONS : QUESTION_TRANSLATIONS;
  const categoryTranslations = helpLanguage === "th" ? THAI_CATEGORY_TRANSLATIONS : CATEGORY_TRANSLATIONS;
  const translationLang = helpLanguage === "th" ? "th" : "zh-CN";
  const visual = QUESTION_VISUALS[current];
  const activeVisual = answered ? visual.answer : visual.question;

  useEffect(() => {
    if (screen === "result" && reviewRef.current) {
      reviewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [screen, reviewOpen]);

  const scrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  function startQuiz() {
    setOptionOrders(createOptionOrders());
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setResponses([]);
    setReviewOpen(false);
    setScore(0);
    setScreen("quiz");
    scrollTop();
  }

  function selectOption(index) {
    if (answered) return;
    setSelected(index);
  }

  function checkAnswer() {
    if (selected === null || answered) return;
    const correct = selectedOption === item.answer;
    setAnswered(true);
    setResponses((prev) => {
      const next = [...prev];
      next[current] = { selected: selectedOption, correct };
      return next;
    });
    if (correct) {
      setScore((prev) => prev + 1);
    }
  }

  function nextQuestion() {
    if (!answered) return;
    if (current < total - 1) {
      setCurrent((value) => value + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }

    const finalScore = score + (selectedOption === item.answer ? 1 : 0);
    onComplete?.(finalScore, Math.round((finalScore / total) * 100));
    setReviewOpen(false);
    setScreen("result");
    scrollTop();
  }

  function toggleReview() {
    setReviewOpen((open) => !open);
  }

  const progressValue = answered ? current + 1 : current;
  const progressPct = Math.round((progressValue / total) * 100);

  let footNote;
  if (answered) {
    footNote = isCorrect ? "Nice work! +1 point." : "Keep going—you can learn from every answer.";
  } else if (selected === null) {
    footNote = "Choose one answer to continue.";
  } else {
    footNote = `Answer selected: ${LETTERS[selected]}`;
  }

  const resultPct = Math.round((score / total) * 100);
  const result = getResultCopy(resultPct);

  const CSS = `
    .kq-root {
      --bg: #f5f7ff;
      --panel: rgba(255, 255, 255, 0.78);
      --panel-strong: rgba(13, 27, 56, 0.95);
      --ink: #14233d;
      --muted: #4c5d7a;
      --line: rgba(36, 62, 101, 0.14);
      --gold: #f5b942;
      --gold-soft: #ffe7a8;
      --teal: #4ab7c3;
      --teal-deep: #1f7a87;
      --green: #34c27a;
      --red: #ea5d57;
      --shadow: 0 24px 60px rgba(17, 33, 57, 0.14);
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      color: var(--ink);
      background-color: #eef5ff;
      background-image: url("/assets/games/know-it-all/know-it-all-welcome-bg.webp");
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      min-height: 100vh;
      padding: 24px 16px 48px;
    }
    .kq-root[data-screen="player-info"] {
      background-image: url("/assets/games/know-it-all/know-it-all-user-input-bg.webp");
    }
    .kq-root[data-screen="start"] {
      background-image: url("/assets/games/know-it-all/know-it-all-main-menu-bg.webp");
    }
    .kq-root[data-screen="how-to"] {
      background-image: url("/assets/games/know-it-all/know-it-all-main-menu-bg.webp");
    }
    .kq-root[data-screen="quiz"] {
      background-image: url("/assets/games/know-it-all/know-it-all-game-bg.webp");
      background-attachment: fixed;
    }
    .kq-root[data-screen="result"] {
      background-image: url("/assets/games/know-it-all/know-it-all-victory-bg.webp");
    }
    .kq-root * { box-sizing: border-box; }
    .kq-root .app {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      gap: 20px;
    }
    .kq-root[data-screen="player-info"] .app {
      min-height: calc(100vh - 72px);
      align-content: center;
    }
    .kq-root[data-screen="player-info"] .quiz-card {
      width: min(560px, 100%);
      justify-self: center;
    }
    .kq-root[data-screen="start"] .app {
      min-height: calc(100vh - 72px);
      align-content: center;
    }
    .kq-root[data-screen="start"] .quiz-card {
      width: min(980px, 100%);
      justify-self: center;
    }
    .kq-root[data-screen="how-to"] .app {
      min-height: calc(100vh - 72px);
      align-content: center;
    }
    .kq-root[data-screen="how-to"] .quiz-card { display: none; }
    .kq-root .hero,
    .kq-root .quiz-card {
      background: rgba(255,255,255,0.72);
      backdrop-filter: blur(10px);
      border: 1px solid var(--line);
      border-radius: 26px;
      box-shadow: var(--shadow);
    }
    .kq-root .translation {
      display: block;
      margin-top: 4px;
      color: #3157ad;
      font-size: 0.95em;
      line-height: 1.5;
      font-weight: 500;
    }
    .kq-root .question-translation {
      margin-top: -10px;
      font-size: 1rem;
    }
    .kq-root .question-visual {
      display: grid;
      place-items: center;
      min-width: 0;
      margin: 0;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 20px;
      background: rgba(255,255,255,0.55);
    }
    .kq-root .question-visual img {
      display: block;
      width: 100%;
      max-width: 100%;
      height: clamp(240px, 48vh, 560px);
      object-fit: contain;
    }
    .kq-root .hero {
      padding: 26px 26px 20px;
      text-align: center;
      overflow: hidden;
      position: relative;
    }
    .kq-root .hero::before {
      content: "";
      position: absolute;
      inset: -40% 12% auto auto;
      width: 260px;
      height: 260px;
      background: radial-gradient(circle, rgba(255, 185, 60, 0.2), transparent 60%);
      pointer-events: none;
    }
    .kq-root .eyebrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(61, 123, 255, 0.08);
      color: #3157ad;
      border: 1px solid rgba(61, 123, 255, 0.12);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .kq-root .hero h1 {
      margin: 18px auto 8px;
      font-size: clamp(2.2rem, 4vw, 4rem);
      line-height: 1.05;
      letter-spacing: -0.05em;
      font-weight: 900;
      max-width: 680px;
      color: #172742;
    }
    .kq-root .shine {
      background: linear-gradient(135deg, #f5af42, #7f6eff, #39b4cc);
      color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
    }
    .kq-root .subtitle {
      margin: 0 auto;
      max-width: 760px;
      color: var(--muted);
      font-size: 1.06rem;
      line-height: 1.6;
    }
    .kq-root .stats {
      margin-top: 22px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }
    .kq-root .stat {
      background: rgba(255,255,255,0.72);
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 14px 12px;
      display: grid;
      gap: 6px;
    }
    .kq-root .stat strong {
      font-size: 1.4rem;
      color: #1b2b42;
    }
    .kq-root .stat span {
      font-size: 0.75rem;
      color: var(--muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .kq-root .quiz-card {
      padding: 22px;
    }
    .kq-root .screen {
      display: none;
    }
    .kq-root .screen.active {
      display: block;
    }
    .kq-root .start-panel,
    .kq-root .result-panel,
    .kq-root .player-info-panel {
      display: grid;
      place-items: center;
      text-align: center;
      gap: 16px;
      padding: 18px 10px 8px;
    }
    .kq-root .player-info-panel {
      justify-items: center;
    }
    .kq-root .big-emoji {
      width: 90px;
      height: 90px;
      border-radius: 24px;
      display: grid;
      place-items: center;
      font-size: 3rem;
      background: linear-gradient(135deg, rgba(255,201,82,0.25), rgba(74,183,195,0.18));
      border: 1px solid rgba(23, 39, 66, 0.06);
    }
    .kq-root .start-panel h2,
    .kq-root .result-panel h2 {
      margin: 0;
      font-size: clamp(1.8rem, 3vw, 2.7rem);
      letter-spacing: -0.04em;
    }
    .kq-root .start-panel p,
    .kq-root .result-panel p,
    .kq-root .player-info-panel p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
      max-width: 700px;
      font-size: 1.02rem;
    }
    .kq-root .player-info-panel label {
      display: grid;
      gap: 8px;
      width: min(360px, 100%);
      text-align: left;
      color: var(--ink);
      font-weight: 700;
    }
    .kq-root .player-info-panel .btn {
      width: min(360px, 100%);
    }
    .kq-root .player-info-panel input {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 13px 15px;
      color: var(--ink);
      background: #fff;
      font: inherit;
    }
    .kq-root .start-details {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 4px;
    }
    .kq-root .detail-chip {
      background: rgba(255,255,255,0.82);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 10px 14px;
      font-weight: 600;
      color: #25496d;
    }
    .kq-root .btn {
      appearance: none;
      border: 0;
      border-radius: 14px;
      padding: 14px 22px;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .kq-root .btn:hover { transform: translateY(-1px); }
    .kq-root .btn:disabled { cursor: not-allowed; opacity: 0.55; }
    .kq-root .btn-primary {
      background: linear-gradient(135deg, #0d1b33, #2d5fc1);
      color: white;
      box-shadow: 0 12px 24px rgba(31, 81, 157, 0.25);
    }
    .kq-root .btn-secondary {
      background: white;
      border: 1px solid var(--line);
      color: var(--ink);
    }
    .kq-root .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(22, 37, 60, 0.07);
    }
    .kq-root .section-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #35548e;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-size: 0.76rem;
    }
    .kq-root .mini-icon {
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      background: rgba(245, 185, 66, 0.18);
    }
    .kq-root .counter {
      color: var(--muted);
      font-weight: 700;
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .kq-root .progress-wrap {
      display: grid;
      gap: 8px;
      margin-bottom: 18px;
    }
    .kq-root .progress-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }
    .kq-root .progress {
      height: 12px;
      border-radius: 999px;
      background: rgba(30, 54, 92, 0.08);
      overflow: hidden;
      border: 1px solid rgba(30, 54, 92, 0.05);
    }
    .kq-root .progress-bar {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #2fb7c7 0%, #f4b942 100%);
      transition: width 0.2s ease;
    }
    .kq-root .question-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
      align-items: stretch;
      gap: 24px;
      padding: 10px 4px 2px;
    }
    .kq-root .question-content { grid-column: 1; grid-row: 1; }
    .kq-root .question-layout > .question-visual { grid-column: 2; grid-row: 1; }
    .kq-root .question-visual { align-self: stretch; }
    .kq-root .question-visual img { height: clamp(200px, 58vh, 680px); }
    .kq-root .question-content {
      display: grid;
      align-content: start;
      gap: 18px;
      min-width: 0;
    }
    .kq-root .question-intro,
    .kq-root .question-answers {
      display: grid;
      align-content: start;
      gap: 18px;
      min-width: 0;
    }
    .kq-root .category {
      display: inline-flex;
      align-self: start;
      justify-self: start;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 800;
      color: #2a6eb9;
      background: rgba(46, 112, 194, 0.08);
      border: 1px solid rgba(46, 112, 194, 0.12);
      padding: 8px 10px;
      border-radius: 999px;
    }
    .kq-root h2 {
      margin: 0;
      font-size: clamp(1.5rem, 2.5vw, 2.3rem);
      line-height: 1.2;
      letter-spacing: -0.04em;
    }
    .kq-root .options {
      display: grid;
      gap: 12px;
    }
    .kq-root .option {
      width: 100%;
      border: 1px solid rgba(19, 31, 58, 0.1);
      background: #fff;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      cursor: pointer;
      text-align: left;
      color: var(--ink);
      transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }
    .kq-root .option:hover:not(:disabled) {
      border-color: rgba(36, 92, 179, 0.35);
      transform: translateY(-1px);
      box-shadow: 0 10px 20px rgba(42, 70, 117, 0.08);
    }
    .kq-root .option.selected {
      background: rgba(64, 129, 255, 0.08);
      border-color: rgba(64, 129, 255, 0.42);
    }
    .kq-root .option.correct {
      background: rgba(52, 194, 122, 0.12);
      border-color: rgba(52, 194, 122, 0.5);
    }
    .kq-root .option.incorrect {
      background: rgba(234, 93, 87, 0.1);
      border-color: rgba(234, 93, 87, 0.5);
    }
    .kq-root .option:disabled {
      cursor: default;
    }
    .kq-root .letter {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: rgba(17, 36, 62, 0.06);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #23436b;
      flex-shrink: 0;
    }
    .kq-root .feedback {
      min-height: 32px;
      display: none;
      padding: 14px 16px;
      border-radius: 14px;
      line-height: 1.5;
      border: 1px solid transparent;
      color: #1c2d4d;
      background: rgba(255, 255, 255, 0.5);
    }
    .kq-root .feedback.show {
      display: block;
    }
    .kq-root .feedback.good {
      background: rgba(52, 194, 122, 0.1);
      border-color: rgba(52, 194, 122, 0.35);
    }
    .kq-root .feedback.bad {
      background: rgba(234, 93, 87, 0.09);
      border-color: rgba(234, 93, 87, 0.35);
    }
    .kq-root .card-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 20px;
      padding-top: 18px;
      border-top: 1px solid rgba(22, 37, 60, 0.07);
    }
    .kq-root .foot-note {
      font-size: 0.92rem;
      color: var(--muted);
      font-weight: 600;
    }
    .kq-root .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
    .kq-root .btn.hidden {
      display: none;
    }
    .kq-root .result-ring {
      position: relative;
      width: 176px;
      height: 176px;
      display: grid;
      place-items: center;
      margin: 8px auto 0;
      border-radius: 50%;
      background: conic-gradient(#4ab7c3 var(--score-angle, 0deg), rgba(30, 54, 92, 0.08) 0deg);
      box-shadow: inset 0 0 0 12px rgba(255,255,255,0.4);
    }
    .kq-root .result-ring > div {
      background: rgba(255,255,255,0.9);
      width: 122px;
      height: 122px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      border: 1px solid rgba(30,54,92,0.08);
    }
    .kq-root .result-score {
      font-size: 2.15rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      color: #15253f;
    }
    .kq-root .result-score span {
      font-size: 1rem;
      color: var(--muted);
      font-weight: 700;
    }
    .kq-root .review-controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 6px;
    }
    .kq-root .review {
      margin-top: 20px;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(18, 30, 50, 0.08);
      border-radius: 18px;
      padding: 18px;
    }
    .kq-root .review.hidden { display: none; }
    .kq-root .review h3 {
      margin: 0 0 12px;
      font-size: 1.1rem;
      color: #21324d;
    }
    .kq-root .review-item {
      border-top: 1px solid rgba(18, 30, 50, 0.08);
      padding-top: 12px;
      margin-top: 12px;
      display: grid;
      gap: 6px;
      text-align: left;
    }
    .kq-root .review-item:first-child { border-top: none; margin-top: 0; }
    .kq-root .q {
      font-weight: 700;
      color: #10213a;
      line-height: 1.45;
    }
    .kq-root .answer,
    .kq-root .your,
    .kq-root .explain {
      color: var(--muted);
      line-height: 1.5;
    }
    .kq-root .your { color: #c97922; }
    .kq-root .explain { font-style: italic; }
    @media (max-width: 700px) {
      .kq-root .stats {
        grid-template-columns: 1fr;
      }
      .kq-root .quiz-card {
        padding: 16px;
      }
      .kq-root .card-foot {
        align-items: stretch;
      }
      .kq-root .actions {
        width: 100%;
      }
      .kq-root .actions .btn {
        flex: 1 1 100%;
      }
      .kq-root .review-controls {
        flex-direction: column;
      }
      .kq-root .review-controls .btn {
        width: 100%;
      }
    }
    @media (max-width: 760px) and (orientation: portrait) {
      .kq-root {
        background-image: url("/assets/games/know-it-all/know-it-all-welcome-phone-bg.webp");
      }
      .kq-root[data-screen="player-info"] {
        background-image: url("/assets/games/know-it-all/know-it-all-user-input-phone-bg.webp");
      }
      .kq-root[data-screen="start"] {
        background-image: url("/assets/games/know-it-all/know-it-all-main-menu-phone-bg.webp");
      }
      .kq-root[data-screen="how-to"] {
        background-image: url("/assets/games/know-it-all/know-it-all-main-menu-phone-bg.webp");
      }
      .kq-root[data-screen="quiz"] {
        background-image: url("/assets/games/know-it-all/know-it-all-game-phone-bg.webp");
      }
      .kq-root[data-screen="result"] {
        background-image: url("/assets/games/know-it-all/know-it-all-victory-phone-bg.webp");
      }
      .kq-root .question-layout {
        grid-template-columns: minmax(0, 1fr);
      }
      .kq-root .question-content {
        display: contents;
      }
      .kq-root .question-intro {
        grid-row: 1;
      }
      .kq-root .question-layout > .question-visual {
        grid-column: 1;
        grid-row: 2;
      }
      .kq-root .question-answers {
        grid-row: 3;
      }
      .kq-root .question-visual img {
        height: clamp(160px, 26vh, 320px);
      }
    }
  `;

  return (
    <div className="kq-root" data-screen={screen}>
      <style>{CSS}</style>
      <main className="app">
        {screen === "how-to" && (
          <section className="hero">
            <div className="eyebrow">⚡ <GameHelpText english="How to play" /> · <GameHelpText english="Curious minds welcome" /></div>
            <h1><GameHelpText english="How to Play 25 Amazing Facts" as="span" /></h1>
            <GameHelpText
              english="Answer 25 multiple-choice questions about animals, space, science, geography, and history. Choose an answer to see instant feedback and an explanation, then review your results at the end."
              as="p"
              className="subtitle"
            />
            <div className="stats">
              <div className="stat"><strong>25</strong><GameHelpText english="Questions" as="span" /></div>
              <div className="stat"><strong>4</strong><GameHelpText english="Choices each" as="span" /></div>
              <div className="stat"><strong>∞</strong><GameHelpText english="Things to learn" as="span" /></div>
            </div>
            <div className="start-details">
              <div className="detail-chip">🎯 <GameHelpText english="Choose the best answer" /></div>
              <div className="detail-chip">💡 <GameHelpText english="Learn with instant feedback" /></div>
              <div className="detail-chip">🔁 <GameHelpText english="Review every answer" /></div>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setScreen("start")}><GameHelpText english="Continue to main menu →" /></button>
          </section>
        )}

        <section className="quiz-card">
          {screen === "player-info" && (
            <div className="screen active">
              <form
                className="player-info-panel"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (playerName.trim()) setScreen("how-to");
                }}
              >
                <div className="big-emoji" aria-hidden="true">👋</div>
                <h2><GameHelpText english="Who’s taking the challenge?" /></h2>
                <GameHelpText english="Enter your name to personalize your Know It All game." as="p" />
                <label htmlFor="know-it-all-player-name">
                  <GameHelpText english="Player 1 name" />
                  <input
                    id="know-it-all-player-name"
                    autoComplete="given-name"
                    maxLength={24}
                    required
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                    placeholder="Enter your name"
                  />
                </label>
                <button type="submit" className="btn btn-primary" disabled={!playerName.trim()}>
                  <GameHelpText english="Continue →" />
                </button>
              </form>
            </div>
          )}

          {screen === "start" && (
            <div className="screen active">
              <div className="start-panel">
                <div className="big-emoji">🧠</div>
                <h2>Ready, {playerName.trim()}?</h2>
                <GameHelpText
                  english="Choose the best answer for each question. Choices appear in a different order each time. You’ll get instant feedback and a quick explanation, then review your score at the end."
                  as="p"
                />
                <div className="start-details">
                  <div className="detail-chip">🎯 <GameHelpText english="1 point per correct answer" /></div>
                  <div className="detail-chip">💡 <GameHelpText english="Learn as you go" /></div>
                  <div className="detail-chip">🔁 <GameHelpText english="Replay any time" /></div>
                </div>
                <button type="button" className="btn btn-primary" onClick={startQuiz}><GameHelpText english="Start the quiz →" /></button>
              </div>
            </div>
          )}

          {screen === "quiz" && (
            <div className="screen active" aria-live="polite">
              <div className="card-head">
                <div className="section-label"><span className="mini-icon">✧</span><span>Brain Power Challenge</span></div>
                <div className="counter">Question {current + 1} of {total}</div>
              </div>
              <div className="progress-wrap">
                <div className="progress-meta"><span>Your progress</span><span>{progressPct}%</span></div>
                <div className="progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={progressValue}>
                  <div className="progress-bar" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              <div className="question-layout">
                <div className="question-content">
                  <div className="question-intro">
                    <div className="category">
                      {item.category.toUpperCase()}
                      {showHelp && <span className="translation" lang={translationLang}>{categoryTranslations[item.category]}</span>}
                    </div>
                    <h2>{item.q}</h2>
                    {showHelp && <p className="translation question-translation" lang={translationLang}>{translations[current].question}</p>}
                  </div>

                  <div className="question-answers">
                    <div className="options">
                      {item.options.map((_, index) => {
                        const originalIndex = optionOrders[current][index];
                        let state = "";
                        if (answered) {
                          if (originalIndex === item.answer) state = " correct";
                          else if (index === selected) state = " incorrect";
                        } else if (index === selected) {
                          state = " selected";
                        }

                        return (
                          <button
                            key={index}
                            type="button"
                            className={`option${state}`}
                            disabled={answered}
                            onClick={() => selectOption(index)}
                          >
                            <span className="letter">{LETTERS[index]}</span>
                            <span>
                              {item.options[originalIndex]}
                              {showHelp && <span className="translation" lang={translationLang}>{translations[current].options[originalIndex]}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className={answered ? `feedback show ${isCorrect ? "good" : "bad"}` : "feedback"} role="status">
                      {answered && (
                        <>
                          <strong>{isCorrect ? "✓ That’s correct!" : "✕ Not quite."}</strong>{" "}
                          {item.explanation}
                          {showHelp && <span className="translation" lang={translationLang}>{translations[current].explanation}</span>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <figure className="question-visual" aria-label={answered ? "Answer context image" : "Question context image"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeVisual.src}
                    alt={activeVisual.alt}
                    loading={current === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </figure>
              </div>

              <div className="card-foot">
                <div className="foot-note">{footNote}</div>
                <div className="actions">
                  <button
                    type="button"
                    className={`btn btn-primary${answered ? " hidden" : ""}`}
                    disabled={selected === null}
                    onClick={checkAnswer}
                  >
                    <GameHelpText english="Check answer" />
                  </button>
                  <button
                    type="button"
                    className={`btn btn-primary${answered ? "" : " hidden"}`}
                    onClick={nextQuestion}
                  >
                    <GameHelpText english={current === total - 1 ? "See my results →" : "Next question →"} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {screen === "result" && (
            <div className="screen active">
              <div className="result-panel">
                <div className="big-emoji">{result.emoji}</div>
                <h2>{result.title}</h2>
                <p>{result.message}</p>
                <div className="result-ring" style={{ '--score-angle': `${resultPct * 3.6}deg` }}>
                  <div>
                    <div className="result-score">
                      {score}<span>/{total}</span>
                    </div>
                  </div>
                </div>
                <p>{resultPct}% correct</p>

                <div className="review-controls">
                  <button type="button" className="btn btn-secondary" onClick={toggleReview}>
                    {reviewOpen ? "Hide review ↑" : "Review answers ↓"}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setScreen("start")}>Main menu</button>
                  <button type="button" className="btn btn-primary" onClick={startQuiz}>Play again ↻</button>
                </div>

                <div ref={reviewRef} className={`review${reviewOpen ? "" : " hidden"}`}>
                  <h3>Answer review</h3>
                  <div>
                    {QUESTIONS.map((question, index) => {
                      const response = responses[index];
                      const yourAnswer = response ? question.options[response.selected] : "Not answered";

                      return (
                        <div className="review-item" key={index}>
                          <div className="q">
                            {index + 1}. {question.q}
                            {showHelp && <span className="translation" lang={translationLang}>{translations[index].question}</span>}
                          </div>
                          <div className="answer">
                            Correct answer: {question.options[question.answer]}
                            {showHelp && <span className="translation" lang={translationLang}>{translations[index].options[question.answer]}</span>}
                          </div>
                          {response && !response.correct && <div className="your">
                            Your answer: {yourAnswer}
                            {showHelp && <span className="translation" lang={translationLang}>{translations[index].options[response.selected]}</span>}
                          </div>}
                          <div className="explain">{question.explanation}</div>
                          {showHelp && <div className="explain translation" lang={translationLang}>{translations[index].explanation}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
