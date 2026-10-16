"use strict";
/* ================= BUILDINGS ================= */
const BUILDINGS = [
  {id:'bubbe',   name:'Bubbe',              plural:'Bubbes',              cost:15,     cps:0.1,    bg:'#F7E6CC', desc:"Bakes rugelach all day and insists you take some home."},
  {id:'bakery',  name:'Challah Bakery',     plural:'Challah Bakeries',    cost:100,    cps:1,      bg:'#F4D7A6', desc:"Braids six strands before sunrise every Friday."},
  {id:'deli',    name:'Kosher Deli',        plural:'Kosher Delis',        cost:1100,   cps:8,      bg:'#F0D2C4', desc:"Pastrami piled so high it needs its own zip code."},
  {id:'school',  name:'Hebrew School',      plural:'Hebrew Schools',      cost:12000,  cps:47,     bg:'#CFE3D4', desc:"Aleph, bet, and a surprising amount of glitter glue."},
  {id:'klezmer', name:'Klezmer Band',       plural:'Klezmer Bands',       cost:130000, cps:260,    bg:'#E9D3EA', desc:"The clarinet wails, the accordion answers, everyone dances."},
  {id:'shul',    name:'Shul',               plural:'Shuls',               cost:1.4e6,  cps:1400,   bg:'#D8E4F2', desc:"Seats assigned by nobody, defended by everybody."},
  {id:'kibbutz', name:'Kibbutz',            plural:'Kibbutzim',           cost:2e7,    cps:7800,   bg:'#DCEBC4', desc:"Up at 4 a.m. to pick avocados, then a very long breakfast."},
  {id:'yeshiva', name:'Yeshiva',            plural:'Yeshivas',            cost:3.3e8,  cps:44000,  bg:'#EADBC3', desc:"Every page of Talmud spawns three more pages of debate."},
  {id:'matzah',  name:'Matzah Factory',     plural:'Matzah Factories',    cost:5.1e9,  cps:2.6e5,  bg:'#F2E4C2', desc:"From water to oven in under eighteen minutes, guaranteed."},
  {id:'olive',   name:'Olive Grove',        plural:'Olive Groves',        cost:7.5e10, cps:1.6e6,  bg:'#E2E8C8', desc:"Some of these trees remember the Maccabees."},
  {id:'scribe',  name:'Torah Scribe Guild', plural:'Torah Scribe Guilds', cost:1e12,   cps:1e7,    bg:'#F3E9CF', desc:"304,805 letters per scroll, each one perfect."},
  {id:'tank',    name:'Mitzvah Tank',       plural:'Mitzvah Tanks',       cost:1.4e13, cps:6.5e7,  bg:'#D6E2F5', desc:"Rolls downtown asking whether you've lit Shabbat candles yet."},
  {id:'hall',    name:'Simcha Hall',        plural:'Simcha Halls',        cost:1.7e14, cps:4.3e8,  bg:'#F5DCE6', desc:"Hosts a wedding, a bar mitzvah and a bris before lunch."},
  {id:'golem',   name:'Golem Workshop',     plural:'Golem Workshops',     cost:2.1e15, cps:2.9e9,  bg:'#E6D2BE', desc:"Clay, a holy word, and strict instructions not to overwork them."},
  {id:'manna',   name:'Manna Generator',    plural:'Manna Generators',    cost:2.6e16, cps:2.1e10, bg:'#E4EEF8', desc:"Falls six days a week, double portion on Fridays."},
  {id:'sea',     name:'Red Sea Hydraulics', plural:'Red Sea Hydraulics',  cost:3.1e17, cps:1.5e11, bg:'#CFE6F5', desc:"Parts any body of water on request. Dry ground included."},
  {id:'bush',    name:'Burning Bush Plant', plural:'Burning Bush Plants', cost:7.1e19, cps:1.1e12, bg:'#F8E0C2', desc:"Burns forever and is never consumed. The cleanest energy around."},
  {id:'ladder',  name:"Jacob's Ladder",     plural:"Jacob's Ladders",     cost:1.2e22, cps:8.3e12, bg:'#E8E4F6', desc:"Angels going up, angels coming down, nobody cuts the line."},
  {id:'chariot', name:'Fiery Chariot',      plural:'Fiery Chariots',      cost:1.9e24, cps:6.4e13, bg:'#F9D9C9', desc:"Built to the design that carried Elijah skyward. Runs hot."},
  {id:'tikkun',  name:'Tikkun Olam Engine', plural:'Tikkun Olam Engines', cost:5.4e26, cps:5.1e14, bg:'#D9EEDF', desc:"Repairs the world one kindness at a time."},
];
BUILDINGS.forEach((b, i) => b.idx = i);
const BMAP = Object.fromEntries(BUILDINGS.map(b => [b.id, b]));

/* ================= BUILDING UPGRADE TIERS ================= */
const TIER_T = [1, 5, 25, 50, 100, 150, 200, 250, 300, 350];
const TIER_M = [10, 50, 500, 5e4, 5e6, 5e8, 5e11, 5e14, 5e17, 5e20];
const TIER_COL = ['#B87333','#D9AE3A','#4E9FD1','#8E63CF','#D9534F','#3FB58A','#E58A2E','#E05CA8','#F2F2F2'];
const TIER_PREFIX = ['Gold-Leaf', 'Illuminated', 'Everlasting'];
const ROMAN = ['I','III','IV','V','VI','VII','VIII','IX','X'];
const UPN = {
  bubbe:  ["Extra Schmaltz","Bigger Mixing Bowl","Recipe Card Box","Second Oven","Bubbe's Book Club","Mah Jongg Night","The Bubbe Network"],
  bakery: ["Six-Strand Braid","Egg Wash Shine","Raisin Option","Sesame Seed Sprinkler","Round Challah Molds","Overnight Proofing","Hafrashat Challah"],
  deli:   ["Thicker Slicer","Pickle Barrel","Rye Supplier","Matzah Ball Annex","Celery Soda Fountain","Sandwich Skyscraper","Take-a-Number Machine"],
  school: ["Aleph-Bet Flashcards","Gold Star Stickers","Shabbat Songbook","Bar Mitzvah Tutor","Glitter Glue Budget","Model Seder Plates","Graduation Cantata"],
  klezmer:["Wailing Clarinet","Squeezebox Upgrade","Fiddler Hire","Tsimbl Mallets","Freylekh Tempo","Doina Solo","Wedding Circuit"],
  shul:   ["Comfier Pews","Kiddush Club","Bigger Bimah","Stained Glass Windows","Sisterhood Bake Sale","Rabbi's Sabbatical","Ner Tamid LEDs"],
  kibbutz:["Avocado Orchard","Dining Hall Expansion","Night Watch Rota","Drip Irrigation","Volunteer Program","Communal Laundry","Kibbutz Guesthouse"],
  yeshiva:["Chavruta Pairs","Extra Commentary","Late-Night Learning","Shtender Upgrade","Talmud Tablets","Pilpul Practice","Daf Yomi Marathon"],
  matzah: ["Faster Rolling Pins","Hotter Ovens","Perforation Wheel","Shmurah Supervision","Eighteen-Minute Timer","Egg Matzah Line","Afikoman Packaging"],
  olive:  ["Pruning Shears","Stone Press","Ancient Rootstock","Menorah Oil Contract","First Cold Press","Grove Guardians","Thousand-Year Trunk"],
  scribe: ["Turkey Quills","Kosher Ink","Ruled Parchment","Steady Hands","Letter Inspection","Crown Flourishes","Siyum Celebration"],
  tank:   ["Bigger Speakers","Lulav Dispenser","Candle Kit Stock","Fleet Expansion","Dance Floor Roof","Shabbat Kit Drop","Nationwide Tour"],
  hall:   ["Chair-Lift Rigging","Chuppah Rental","Sweet Table","Hora Dance Floor","DJ Who Knows the Songs","Rooftop Ceremony","Three Simchas Daily"],
  golem:  ["Riverbank Clay","Holy Word Tablets","Clay Quality Control","Golem Shabbat Off","Self-Sculpting Golems","Rabbi Loew's Manual","Golem Assembly Line"],
  manna:  ["Dew Layer","Coriander Seasoning","Double-Portion Fridays","Wafer Texture","Desert Collection Baskets","Forty-Year Supply","Heavenly Delivery"],
  sea:    ["Staff of Moses","East Wind Generators","Seabed Drying","Wall of Water","Miriam's Tambourine","Song of the Sea","Any Sea, Any Time"],
  bush:   ["Holy Ground Signage","Sandal Check Stand","Unconsumed Branches","Flame Monitors","Shepherd's Staff","Desert Substation","Eternal Flame Grid"],
  ladder: ["Sturdier Rungs","Angel Traffic Control","Dream Journal","Stone Pillow","Ascending Lanes","Descending Lanes","Gate of Heaven Station"],
  chariot:["Fireproof Axles","Whirlwind Turbines","Prophet's Mantle","Open Door at the Seder","Cup of Elijah Refills","Chariot Fleet","Horses of Fire"],
  tikkun: ["Small Kindnesses","Food Pantry","Community Garden","Visiting the Sick","Welcoming Guests","Repair Crews","One World, Mended"],
};
const BUBBE_SYN = {
  bakery:"Bubbe's Braiding Lessons", deli:"Bubbe Reviews the Pickles", school:"Bubbe Volunteers at Hebrew School",
  klezmer:"Bubbe Requests a Song", shul:"Bubbe Joins the Sisterhood", kibbutz:"Bubbe Visits the Kibbutz",
  yeshiva:"Bubbe Packs the Lunches", matzah:"Bubbe Checks for Crumbs", olive:"Bubbe Presses the Oil",
  scribe:"Bubbe Proofreads the Scroll", tank:"Bubbe Rides Shotgun", hall:"Bubbe Plans the Seating Chart",
  golem:"Bubbe Feeds the Golems", manna:"Bubbe Seasons the Manna", sea:"Bubbe Brings a Raincoat",
  bush:"Bubbe Warms Her Hands", ladder:"Bubbe Holds the Ladder", chariot:"Bubbe Packs a Snack for the Road",
  tikkun:"Bubbe Fixes Everything",
};

/* ================= CLICK UPGRADES ================= */
const CLICK_UPS = [
  {id:'c0', name:'Calloused Fingers', cost:100,  dbl:1, need:0,    flavor:'From years of turning siddur pages.'},
  {id:'c1', name:'Dreidel Wrist',     cost:500,  dbl:1, need:50,   flavor:'Spins true. Lands on gimel... sometimes.'},
  {id:'c2', name:'Grogger Arm',       cost:1e4,  dbl:1, need:1000, flavor:'Built up drowning out Haman, one Purim at a time.'},
  {id:'c3', name:'Mensch Touch',      cost:5e4,  pct:1, need:5e3,  flavor:'A good deed is never wasted.'},
  {id:'c4', name:'Chutzpah Click',    cost:5e6,  pct:1, need:5e5,  flavor:'Click like you mean it.'},
  {id:'c5', name:'Shpilkes',          cost:5e8,  pct:1, need:5e7,  flavor:"Can't sit still. Won't sit still."},
  {id:'c6', name:'Kiddush Line Reflexes', cost:5e10, pct:1, need:5e9, flavor:'Honed reaching for the last kichel.'},
  {id:'c7', name:'Mazel Tap',         cost:5e12, pct:1, need:5e11, flavor:'Every tap is a little lucky.'},
  {id:'c8', name:'Hora Hands',        cost:5e14, pct:1, need:5e13, flavor:'Arms on shoulders, feet flying.'},
];
const HANDS_UPS = [
  {id:'hh0', name:'Helping Hands',       cost:1e5,  x:0.1, need:1,   flavor:'Everybody pitches in.'},
  {id:'hh1', name:'Extended Family',     cost:1e7, x:5,   need:10,  flavor:'Cousins you have never met show up to help.'},
  {id:'hh2', name:'Whole Congregation',  cost:1e8,  x:10,  need:25,  flavor:'Even the people who only come on the High Holidays.'},
  {id:'hh3', name:'Whole Neighborhood',  cost:1e10, x:20,  need:50,  flavor:'The block association is in.'},
  {id:'hh4', name:'Whole City',          cost:1e13, x:20,  need:100, flavor:'Traffic stops for the hora.'},
  {id:'hh5', name:'Whole World',         cost:1e16, x:20,  need:150, flavor:'Everyone is somebody\'s cousin, eventually.'},
];

/* ================= FOOD UPGRADES ================= */
const FOODS = [
  ['Rugelach','Rolled, filled, gone in minutes.'],
  ['Babka','Chocolate swirl. Do not settle for less.'],
  ['Hamantaschen','Three corners, endless filling debates.'],
  ['Latkes','Fried in oil, as the miracle intended.'],
  ['Sufganiyot','Jelly on the outside of your sleeve, mostly.'],
  ['Kugel','Sweet or savory, both are correct.'],
  ['Matzah Ball Soup','Floaters versus sinkers: choose your side.'],
  ['Bagels and Lox','Schmear generously.'],
  ['Knish','Potato, kasha, or a surprise.'],
  ['Blintzes','A Shavuot classic, any day of the year.'],
  ['Kreplach','Little dumplings with big opinions.'],
  ['Pastrami on Rye','Mustard only. Do not ask for mayo.'],
  ['Shakshuka','Eggs poached in spicy tomato. Bread required.'],
  ['Hummus','Pillowy, with a pool of olive oil.'],
  ['Falafel','Crisp outside, green inside.'],
  ['Sabich','Eggplant, egg, amba, joy.'],
  ['Bourekas','Flaky, cheesy, gone by kiddush.'],
  ['Halva','Sesame, sugar, and a little magic.'],
  ['Mandelbrot','Twice baked, never stale.'],
  ['Honey Cake','Wishing you a sweet year.'],
  ['Tzimmes','Carrots made festive.'],
  ['Cholent','Simmered from Friday to Saturday lunch.'],
  ['Kasha Varnishkes','Bow ties and buckwheat, a classic duo.'],
  ['Gefilte Fish','Jar or homemade? Bubbe has thoughts.'],
  ['Jachnun','Slow-baked overnight, served with grated tomato.'],
  ['Malawach','Flaky Yemenite flatbread, best with schug.'],
  ['Kubbeh Soup','Dumplings in a tangy broth, straight from Bubbe\'s kitchen.'],
  ['Moroccan Fish','Red peppers, cilantro, and Friday night.'],
  ['Coconut Macaroons','The Passover cookie, defended passionately.'],
  ['Charoset','Apples, nuts, wine, and memory.'],
  ['Black and White Cookie','Look to the cookie.'],
  ['Challah French Toast','Sunday morning, sorted.'],
  ['Bamba','Peanut puffs, a national treasure.'],
  ['Teiglach','Little dough knots in honey for Rosh Hashanah.'],
  ['Cheesecake','Shavuot\'s finest hour.'],
  ["Bubbe's Secret Brisket",'"A little of this, a little of that." The recipe remains classified.'],
].map((f, i) => ({id:'f'+i, name:f[0], flavor:f[1], pct:[5,10,15,20,25,30][Math.floor(i/6)], cost:5e5*Math.pow(5, i)}));

/* ================= NACHAS (achievement-scaling) ================= */
const NACHAS_UPS = [
  {id:'k0', name:'Proud Parents',          f:0.10,  need:13,  cost:9e6},
  {id:'k1', name:'Kvelling Grandparents',  f:0.125, need:25,  cost:9e9},
  {id:'k2', name:'Bragging Aunts',         f:0.15,  need:50,  cost:9e12},
  {id:'k3', name:'Fridge-Magnet Cousins',  f:0.175, need:75,  cost:9e15},
  {id:'k4', name:'Photo Album Uncles',     f:0.2,   need:100, cost:9e18},
  {id:'k5', name:'The Whole Mishpacha',    f:0.2,   need:150, cost:9e21},
  {id:'k6', name:'Ancestors Smiling Down', f:0.2,   need:200, cost:9e24},
];

/* ================= GOLDEN GELT UPGRADES ================= */
const GOLD_UPS = [
  {id:'g0', name:'Lucky Dreidel',  cost:777777, need:7,   desc:'Golden gelt appears twice as often.', flavor:'Nun, gimel, hey, shin. Mostly gimel.'},
  {id:'g1', name:'Thicker Foil',   cost:7.77e7, need:27,  desc:'Golden gelt effects last twice as long.', flavor:'Keeps the chocolate fresh for longer.'},
  {id:'g2', name:'Gimel!',         cost:7.77e9, need:77,  desc:'Lucky gelt pays out twice as much.', flavor:'Take the whole pot.'},
  {id:'g3', name:'Shiny Wrapper',  cost:7.77e11,need:177, desc:'Golden gelt stays on screen twice as long.', flavor:'Impossible to miss.'},
];

/* ================= SEASONS ================= */
const SEASONS = {
  none:    {name:'No holiday', desc:'An ordinary stretch of days.'},
  rosh:    {name:'Rosh Hashanah', critterName:'a honey-dipped apple', all:1.1,
            desc:'Apples and honey for a sweet year: all production +10%.',
            drops:['Round Challah','Honey Cake Slice','Apple Orchard Basket','Shofar Polish','Pomegranate Platter']},
  sukkot:  {name:'Sukkot', critterName:'a runaway etrog', b:{olive:2, kibbutz:2},
            desc:'Harvest festival: Olive Grove and Kibbutz ×2.',
            drops:['Etrog Box','Lulav Bundle','Sukkah Lights','Harvest Squash','Stuffed Cabbage']},
  hanukkah:{name:'Hanukkah', critterName:'a spinning dreidel', gelt:2,
            desc:'Eight nights of gelt: golden gelt appears twice as often.',
            drops:['Silver Dreidel','Latke Platter','Cruse of Oil','Sufganiyah Tower','Ninth Candle']},
  purim:   {name:'Purim', critterName:'a Purim mask', click:2,
            desc:'Groggers everywhere: every click is worth double.',
            drops:['Mishloach Manot Basket','Grogger Collection','Masquerade Mask',"Queen Esther's Crown",'Hamantasch Platter']},
  pesach:  {name:'Passover', critterName:'the afikoman', b:{matzah:3, bakery:0.5},
            desc:'Matzah Factory ×3. Challah Bakery ×0.5, since there is no bread this week.',
            drops:['Seder Plate',"Elijah's Cup",'Macaroon Tin','Charoset Bowl','Afikoman Prize']},
  shavuot: {name:'Shavuot', critterName:'a flower garland', b:{bubbe:3, yeshiva:2},
            desc:'Dairy and all-night learning: Bubbe ×3 and Yeshiva ×2.',
            drops:['Cheesecake Wedge','Flower Garland','Blintz Stack','Night of Learning','First Fruits Basket']},
};

/* ================= HERITAGE (prestige) UPGRADES ================= */
const HERITAGE_UPS = [
  {id:'h0',  name:'Heirloom Candlesticks',     cost:1,    prod:0.10, desc:'All production +10%.'},
  {id:'h1',  name:'Family Recipes',            cost:3,    desc:'Golden gelt appears 10% more often.'},
  {id:'h2',  name:"Zayde's Pocket Watch",      cost:5,    desc:'Earn 100% of production while away instead of 50%.'},
  {id:'h3',  name:"Grandma's Mezuzah",         cost:7,    desc:'Golden gelt effects last 10% longer.'},
  {id:'h4',  name:'Old Country Loom',          cost:10,   desc:'Buildings cost 5% less.'},
  {id:'h5',  name:'Starter Kit',               cost:15,   desc:'Each new generation starts with 10 Bubbes and 5 Challah Bakeries.'},
  {id:'h6',  name:'Family Tree Chart',         cost:25,   desc:'The nachas bonus from achievements is 25% stronger.'},
  {id:'h7',  name:"Great-Grandfather's Tallit",cost:40,   desc:'Clicking is twice as powerful.'},
  {id:'h8',  name:'Shtetl Memories',           cost:60,   desc:'Upgrades cost 5% less.'},
  {id:'h9',  name:'Second Seder Plate',        cost:100,  desc:'Holiday visitors appear twice as often.'},
  {id:'h10', name:'Keepsake Pomegranate',      cost:150,  desc:'Pomegranates ripen 20% faster.'},
  {id:'h11', name:'Heirloom Luach',            cost:200,  desc:'Holiday seasons stay unlocked in every generation.'},
  {id:'h12', name:'Golden Kiddush Cup',        cost:300,  prod:0.25, desc:'All production +25%.'},
  {id:'h13', name:'Stories by the Fire',       cost:500,  desc:'Golden gelt can grant a Building Blessing: +10% production per building of one type for 30 seconds.'},
  {id:'h14', name:'Generations of Wisdom',     cost:777,  desc:'Torah Study and Dreidel cooldowns are halved.'},
  {id:'h15', name:'Ner Tamid',                 cost:1000, prod:0.5, desc:'All production +50%.'},
  {id:'h16', name:'Unbroken Chain',            cost:2500, desc:'Heritage points give +2% production each instead of +1%.'},
];

/* ================= KIBBUTZ FIELDS (garden) ================= */
const SPECIES = [
  {id:'wheat',   name:'Wheat',       need:1,   grow:120,  cost:60,   pay:180,   fx:{cps:0.01},   eff:'+1% production while ripe'},
  {id:'barley',  name:'Barley',      need:10,  grow:180,  cost:120,  pay:360,   fx:{click:0.02}, eff:'+2% click power while ripe'},
  {id:'grapes',  name:'Grapes',      need:25,  grow:300,  cost:300,  pay:900,   fx:{freq:0.02},  eff:'Golden gelt +2% more often while ripe'},
  {id:'figs',    name:'Figs',        art:'fig', need:50,  grow:480, cost:600,  pay:1800,  fx:{dur:0.02},   eff:'Golden gelt effects +2% longer while ripe'},
  {id:'pomegranates', name:'Pomegranates', art:'pom', need:75, grow:720, cost:1200, pay:3600, fx:{}, eff:'15% chance to yield a ripe pomegranate when harvested'},
  {id:'olives',  name:'Olives',      need:100, grow:1200, cost:2400, pay:7200,  fx:{cheap:0.01}, eff:'Buildings 1% cheaper while ripe (up to 10%)'},
  {id:'dates',   name:'Dates',       need:150, grow:1800, cost:3600, pay:10800, fx:{cps:0.03},   eff:'+3% production while ripe'},
];
const SPECIES_MAP = Object.fromEntries(SPECIES.map(s => [s.id, s]));

/* ================= TORAH STUDY (trivia) ================= */
const TRIVIA = [
  ['How many nights is Hanukkah?', ['Six','Eight','Ten'], 2],
  ['What is the nine-branched Hanukkah candleholder called?', ['Mezuzah','Kiddush cup','Shofar'], 1],
  ['Which holiday celebrates the giving of the Torah at Mount Sinai?', ['Sukkot','Shavuot','Tu BiShvat'], 2],
  ['What do people eat on Rosh Hashanah for a sweet new year?', ['Apples dipped in honey','Hamantaschen','Matzah'], 0],
  ['How many questions are traditionally asked at the Passover seder?', ['Two','Four','Ten'], 2],
  ['What is the hidden piece of matzah at the seder called?', ['Afikoman','Karpas','Maror'], 0],
  ['Which book of the Bible is read on Purim?', ['Ruth','Jonah','Genesis'], 1],
  ['What instrument made from a ram\'s horn is blown on Rosh Hashanah?', ['Grogger','Tambourine','Lyre'], 1],
  ['How many adults are needed for a minyan?', ['Seven','Twelve','Eighteen'], 1],
  ['On which holiday do people build and eat in a temporary hut?', ['Passover','Sukkot','Shavuot'], 2],
  ['Which citrus fruit is one of the four species waved on Sukkot?', ['Lemon','Orange','Lime'], 1],
  ['What is the Day of Atonement called?', ['Yom Kippur','Simchat Torah','Tisha B\'Av'], 0],
  ['How many books are in the Torah, the Five Books of Moses?', ['Three','Seven','Twelve'], 1],
  ['What is the first book of the Torah?', ['Exodus','Genesis','Deuteronomy'], 2],
  ['What does "shalom" mean?', ['Peace','Light','Thank you'], 0],
  ['What does "mazel tov" express?', ['Sorry','Good night','Be careful'], 1],
  ['Which dreidel letter means you take the whole pot?', ['Nun','Hey','Shin'], 1],
  ['The dreidel letters stand for a phrase meaning:', ['A great miracle happened there','Let us rejoice','Next year in Jerusalem'], 0],
  ['What is the braided bread eaten on Shabbat?', ['Bagel','Challah','Rye'], 2],
  ['What is the small scroll case attached to a doorpost?', ['Tallit','Tefillin','Kippah'], 1],
  ['Which holiday is called the New Year for Trees?', ['Tu BiShvat','Purim','Sukkot'], 0],
  ['Which ceremony ends Shabbat with a braided candle, wine, and spices?', ['Kiddush','Hallel','Shacharit'], 1],
  ['Which queen saved the Jewish people in the Purim story?', ['Queen Esther','Queen of Sheba','Queen Miriam'], 0],
  ['Who is the villain whose name is drowned out by groggers on Purim?', ['Pharaoh','Haman','Antiochus'], 2],
  ['Which family led the revolt in the Hanukkah story?', ['The Maccabees','The Davidics','The Pharisees'], 0],
  ['How long did the oil last in the Hanukkah miracle?', ['One day','Seven days','Eight days'], 3],
  ['What is the Jewish wedding canopy called?', ['Chuppah','Bimah','Ketubah'], 0],
  ['What does the groom traditionally break at the end of a Jewish wedding?', ['A plate','A stick','A matzah'], 1],
  ['At what age does a boy traditionally become a bar mitzvah?', ['10','13','16'], 2],
  ['What is the Hebrew word for charitable giving?', ['Tzedakah','Tefillah','Torah'], 0],
  ['Who led the Israelites out of Egypt?', ['Abraham','David','Joshua'], 1],
  ['How many plagues struck Egypt in the Exodus story?', ['Seven','Twelve','Forty'], 1],
  ['How many years did the Israelites wander in the desert?', ['Seven','Forty','One hundred'], 2],
  ['What food fell from heaven for the Israelites in the desert?', ['Matzah','Honey','Figs'], 1],
  ['On which mountain did Moses receive the Ten Commandments?', ['Mount Sinai','Mount Carmel','Mount Hermon'], 0],
  ['How many letters are in the Hebrew alphabet?', ['18','26','32'], 1],
  ['Which direction is Hebrew written?', ['Left to right','Top to bottom','Bottom to top'], 1],
  ['Which holiday is celebrated with costumes and groggers?', ['Purim','Passover','Shavuot'], 0],
  ['What shape are hamantaschen?', ['Round','Triangular','Crescent'], 2],
  ['Which seder song\'s title means "It would have been enough"?', ['Dayenu','Echad Mi Yodea','Adir Hu'], 0],
  ['Which holiday celebrates finishing and restarting the yearly Torah reading?', ['Simchat Torah','Purim','Hanukkah'], 0],
  ['What is the Jewish prayer shawl called?', ['Kippah','Tefillin','Kittel'], 1],
  ['What does "l\'chaim" mean?', ['To life','Welcome','Let us eat'], 0],
  ['What does "Hava Nagila" mean?', ['Let us rejoice','Happy birthday','Peace to you'], 0],
  ['What is the eternal light above the ark in a synagogue called?', ['Ner Tamid','Havdalah candle','Yahrzeit'], 0],
  ['Including the shamash, how many candles burn on the last night of Hanukkah?', ['Eight','Ten','Twelve'], 1],
  ['Why is matzah eaten on Passover?', ['The Israelites left Egypt in such a hurry the bread could not rise','It stays fresh longest','Moses preferred it'], 0],
  ['According to tradition, which fruit has 613 seeds?', ['Fig','Date','Grape'], 1],
  ['What is the cabinet that holds the Torah scrolls in a synagogue called?', ['The Ark','The Sukkah','The Chuppah'], 0],
  ['For whom is a special cup of wine poured at the seder?', ['Moses','Miriam','Aaron'], 1],
  ['What does "Rosh Hashanah" literally mean?', ['Head of the Year','Festival of Booths','Sweet Beginning'], 0],
  ['What foods are traditionally eaten on Shavuot?', ['Dairy foods','Bitter herbs','Fish only'], 0],
  ['How many challah loaves are traditionally on the Shabbat table?', ['One','Three','Seven'], 1],
  ['What does "kosher" mean?', ['Delicious','Blessed','Fresh'], 1],
  ['The name "Purim" comes from a word meaning:', ['Lots','Queens','Cookies'], 0],
  ['What does "Hanukkah" mean?', ['Light','Oil','Victory'], 1],
  ['What is the weekly Torah portion called?', ['Parashah','Midrash','Mishnah'], 0],
  ['When does Shabbat begin?', ['Friday at sunset','Friday at noon','Sunday morning'], 0],
];
