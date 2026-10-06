import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/image/logo.png';

/* ==================================================================
   SPECIES DATA
   Every field the detail view needs lives right here, so "Learn more"
   opens an in-page panel instead of navigating to another route.
   NOTE: if an image URL fails, the card automatically falls back to
   a matching emoji tile, so a card can never show the wrong animal.
   ================================================================== */
const SPECIES_DATA = [
  {
    id: 1,
    name: 'African Elephant',
    emoji: '🐘',
    bigFive: true,
    scientific: 'Loxodonta africana',
    status: 'Endangered',
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=900&q=80',
    tagline: 'The gentle giant that engineers the savanna.',
    habitat: 'Savanna, Open woodland, Forest edges',
    diet: 'Herbivore — grasses, bark, roots, fruit, leaves',
    weight: '4,000 – 6,300 kg',
    height: '3.0 – 4.0 m at the shoulder',
    lifespan: '60 – 70 years',
    speed: '40 km/h',
    population: '≈ 415,000 across Africa',
    range: 'Sub-Saharan Africa — Samburu, Tsavo, Amboseli & Marsabit in Kenya',
    overview:
      'The African bush elephant is the largest land animal alive today and one of the most intelligent creatures on the planet. Matriarch-led herds travel long distances across the savanna in search of water and forage, and their constant trampling, digging and dung-dropping creates habitat for countless other species — which is why elephants are often called "ecosystem engineers".',
    behaviour:
      'Elephants live in close-knit family herds led by the oldest female, the matriarch. They communicate through low-frequency rumbles, many of which fall below the range of human hearing, and can pick up vibrations through their feet from several kilometres away. Bulls form loose bachelor groups and rejoin the herd mainly to mate. Elephants have exceptional memories and return to the same waterholes and mineral licks year after year.',
    facts: [
      'An adult eats up to 150 kg of vegetation and drinks up to 190 litres of water a day.',
      'The trunk holds roughly 40,000 muscle units and can pick up a single blade of grass — or a 270 kg log.',
      'Tusks are modified incisor teeth and keep growing throughout life.',
      'Pregnancy lasts about 22 months, the longest gestation of any mammal.',
      'Elephants can recognise themselves in a mirror — a sign of self-awareness shared by very few animals.',
    ],
    threats: [
      'Habitat loss and fragmentation',
      'Ivory poaching',
      'Human–elephant conflict over crops and water',
      'Drought linked to climate change',
    ],
    conservation:
      'Elephants are fully protected under Kenyan law and listed on CITES Appendix I. Anti-poaching patrols, community conservancies and wildlife corridors around Samburu, Laikipia and Tsavo have helped stabilise several populations. Supporting community conservancies — and reporting snares, carcasses or injured animals — remains one of the most effective ways to help.',
  },
  {
    id: 2,
    name: 'Lion',
    emoji: '🦁',
    bigFive: true,
    scientific: 'Panthera leo',
    status: 'Vulnerable',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=900&q=80',
    tagline: 'The only truly social big cat.',
    habitat: 'Grassland, Savanna, Open woodland',
    diet: 'Carnivore — antelope, zebra, buffalo, warthog',
    weight: '150 – 225 kg (males), 110 – 150 kg (females)',
    height: 'About 1.2 m at the shoulder',
    lifespan: '12 – 16 years in the wild',
    speed: '80 km/h in short bursts',
    population: '≈ 23,000 mature individuals in Africa',
    range: 'Sub-Saharan Africa — northern Kenya strongholds in Samburu, Laikipia & Meru',
    overview:
      'Lions are the only cats that live in genuine social groups. A pride is a matrilineal family of related females, their cubs, and a coalition of one to four resident males who defend the territory. Working together, lionesses can bring down prey far larger than themselves, and the sharing of kills is what makes group living worthwhile.',
    behaviour:
      'Hunting is mostly done at night or in the cool early hours, with lionesses coordinating from different directions to cut off escape routes. Males patrol and scent-mark the territory boundaries, roaring to advertise their presence — a lion\'s roar can carry up to 8 km at night. Cubs are raised communally, and females in a pride often synchronise their breeding so that cubs can be nursed by more than one mother.',
    facts: [
      'A lion\'s roar can be heard up to 8 km away.',
      'Lions rest for around 20 hours a day and hunt mostly at dusk and dawn.',
      'A male\'s mane darkens with age and signals fitness to rivals and mates.',
      'Lion cubs are born with spots that fade as they mature.',
      'The lion is one of Kenya\'s "Big Five" and appears on the national coat of arms.',
    ],
    threats: [
      'Retaliatory killing after livestock attacks',
      'Loss of prey through bushmeat poaching',
      'Habitat fragmentation and fencing',
      'Disease outbreaks in small populations',
    ],
    conservation:
      'Kenya\'s lion population is estimated at around 2,500 animals. Programmes such as predator-proof bomas (reinforced livestock enclosures), compensation schemes and community conservancies have sharply reduced retaliatory killings. Reporting livestock losses or lion sightings helps rangers target protection where it is needed most.',
  },
  {
    id: 3,
    name: 'Giraffe',
    emoji: '🦒',
    bigFive: false,
    scientific: 'Giraffa camelopardalis',
    status: 'Vulnerable',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSi-DYB1Saa-dvMfeHz396pOyKNjwfxWly--okUiyWrA&s=10',
    tagline: 'The tallest animal on Earth.',
    habitat: 'Savanna, Dry woodland, Grassland',
    diet: 'Herbivore — mostly acacia leaves, shoots and pods',
    weight: '800 – 1,200 kg',
    height: '4.5 – 5.5 m',
    lifespan: '20 – 25 years',
    speed: '60 km/h',
    population: '≈ 117,000 across Africa',
    range: 'Sub-Saharan Africa — Samburu & Laikipia are strongholds for the reticulated giraffe',
    overview:
      'Giraffes are the tallest land animals alive, with males reaching over five metres. Their extraordinary height lets them browse foliage that no other large herbivore can reach, so they feed above the competition — a niche that has kept them successful for millions of years. Kenya is home to three distinct subspecies: reticulated, Masai and Rothschild\'s.',
    behaviour:
      'Giraffes live in loose, open herds with no fixed leader; individuals drift in and out of groups during the day. Bulls compete for dominance in slow, ritualised "necking" contests, swinging their heavy skulls at one another. Despite their size, giraffes sleep very little — usually just a few minutes at a time, and rarely more than two hours a day.',
    facts: [
      'A giraffe\'s tongue is about 45 cm long and dark purple, which protects it from sunburn.',
      'The neck contains just seven vertebrae — the same number as a human.',
      'A giraffe heart weighs around 11 kg and pumps blood up a 2 m column.',
      'Calves can stand and walk within an hour of birth and are about 1.8 m tall.',
      'Giraffes sleep on average less than two hours a day.',
    ],
    threats: [
      'Habitat loss and conversion to farmland',
      'Illegal bushmeat poaching',
      'Fragmentation separating populations',
      'Rarely, skin and bone trade',
    ],
    conservation:
      'Giraffe numbers have fallen sharply across Africa, but community conservancies in Samburu, Laikipia and Isiolo have become a global model for giraffe recovery — particularly for the reticulated giraffe. Twiga Walinzi ("giraffe guards") teams use photo-ID catalogues to track individuals and remove snares.',
  },
  {
    id: 4,
    name: 'Zebra',
    emoji: '🦓',
    bigFive: false,
    scientific: 'Equus quagga',
    status: 'Near Threatened',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHLc7lKNJcaeuPAz0Mjt57WKweWtOrG94uZiW8x-Juhw&s=10',
    tagline: 'Stripes as unique as a fingerprint.',
    habitat: 'Grassland, Savanna',
    diet: 'Grazer — almost entirely grasses',
    weight: '220 – 320 kg',
    height: '1.3 – 1.4 m at the shoulder',
    lifespan: '20 – 25 years',
    speed: '65 km/h',
    population: '≈ 150,000 mature individuals',
    range: 'Eastern & Southern Africa — Laikipia, Tsavo and the Maasai Mara',
    overview:
      'The plains zebra is the most widespread and numerous of the three zebra species. Zebras are pioneer grazers: they move into tall, coarse grass ahead of wildebeest and other herbivores, cropping it down so that more selective feeders can follow. In this way they shape the entire grazing sequence of the savanna.',
    behaviour:
      'Zebras live in small family harems made up of a stallion, several mares and their foals, which band together into much larger herds. The bond between a mare and her foal is intense — a mother will defend her young against predators. Bachelor males form their own groups until they are strong enough to claim a harem.',
    facts: [
      'Every zebra has a unique stripe pattern; foals recognise their mother by hers.',
      'A zebra\'s skin is black — the white hairs grow over it.',
      'The stripes are thought to confuse predators and repel biting flies.',
      'Zebras can run up to 65 km/h and will zig-zag when fleeing.',
      'Plains zebras are part of the great Serengeti–Mara migration of nearly 2 million animals.',
    ],
    threats: [
      'Competition with livestock for grazing',
      'Habitat loss to agriculture and fencing',
      'Hunting for meat and skins',
      'Drought and reduced water access',
    ],
    conservation:
      'Zebras are relatively adaptable and can thrive in community conservancies that maintain open grassland. Keeping migration routes and dry-season water sources open is the single most important measure for their long-term survival.',
  },
  {
    id: 5,
    name: 'Cheetah',
    emoji: '🐆',
    bigFive: false,
    scientific: 'Acinonyx jubatus',
    status: 'Vulnerable',
    image: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=900&q=80',
    tagline: 'The fastest land animal on Earth.',
    habitat: 'Savanna, Semi-desert, Open grassland',
    diet: 'Carnivore — gazelle, impala, hares, ground birds',
    weight: '40 – 65 kg',
    height: '0.8 – 0.9 m at the shoulder',
    lifespan: '10 – 12 years in the wild',
    speed: '0 – 100 km/h in about 3 seconds; top speed ≈ 112 km/h',
    population: '≈ 6,700 mature individuals',
    range: 'Sub-Saharan Africa — Laikipia, Samburu and the Maasai Mara',
    overview:
      'The cheetah is built for pure speed: a light, narrow body, an oversized heart and lungs, and a long tail that acts as a rudder. It is the only big cat that cannot roar. Instead it purrs, chirps and makes a remarkable high-pitched "yip" to call its cubs. Cheetahs hunt by sight in the cool of early morning and late afternoon, using a burst of acceleration rather than strength.',
    behaviour:
      'Females are solitary except when raising cubs; males often form lifelong coalitions of two or three brothers. Because cheetahs are lightly built, they lose kills to lions, hyenas and leopards — so they hunt quickly and eat fast. Cubs are born with a silvery mantle of fur down their backs, which may help camouflage them in grass.',
    facts: [
      'Cheetahs have semi-retractable claws that grip the ground like running spikes.',
      'Black "tear marks" running from the eyes to the mouth reduce glare from the sun.',
      'They can only sprint for around 20–30 seconds before overheating.',
      'Cheetahs cannot roar — they purr, chirp and hiss instead.',
      'A cheetah can accelerate faster than most sports cars.',
    ],
    threats: [
      'Loss of habitat and prey',
      'Human–wildlife conflict with livestock farmers',
      'Trapping for the illegal pet trade',
      'Predation of cubs by lions and hyenas',
    ],
    conservation:
      'Kenya holds one of the world\'s most important cheetah populations. The Kenya Wildlife Service, Action for Cheetahs in Kenya and local conservancies promote livestock-guarding dogs, cheetah-friendly ranching and education programmes that reduce conflict. Never support the pet trade — a cheetah cub in a photograph is a wild animal taken from its mother.',
  },
  {
    id: 6,
    name: 'Hippopotamus',
    emoji: '🦛',
    bigFive: false,
    scientific: 'Hippopotamus amphibius',
    status: 'Vulnerable',
    /* ✅ Fixed — image source restored */
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShDxvuC5-op61rbFGpqtyipEOxsUb2ll5yS35F72poUA&s=10',
    tagline: 'Africa\'s most dangerous large herbivore.',
    habitat: 'Rivers, Lakes, Wetlands',
    diet: 'Herbivore — mainly short grasses, grazed at night',
    weight: '1,300 – 1,800 kg',
    height: 'About 1.5 m at the shoulder',
    lifespan: '40 – 50 years',
    speed: '30 km/h on land',
    population: '≈ 115,000 – 130,000',
    range: 'Sub-Saharan Africa — the Mara River, Tsavo and the Ewaso Nyiro',
    overview:
      'The hippopotamus is a huge semi-aquatic mammal that spends its days submerged in rivers and lakes and its nights grazing on land. Despite its bulky, docile appearance, it is one of the most dangerous large animals in Africa and can open its jaws to almost 150 degrees.',
    behaviour:
      'Hippos live in pods of 10–30 animals, led by a dominant bull who controls a stretch of water. Males fight fiercely over territory, using their enormous canine tusks. Each night, herds leave the water and can walk several kilometres inland to graze, following the same well-worn paths, then return to the water before dawn.',
    facts: [
      'Hippos secrete a reddish oily fluid often called "blood sweat" — it is a natural sunscreen and antibiotic.',
      'They can hold their breath for around five minutes and even sleep underwater, surfacing automatically to breathe.',
      'Their closest living relatives are whales and dolphins, not pigs.',
      'A hippo\'s bite can exert more force than a lion\'s.',
      'They can run faster than a human over short distances.',
    ],
    threats: [
      'Poaching for meat and ivory-like teeth',
      'Loss of rivers and wetlands to irrigation and drought',
      'Conflict with fishing communities and boat traffic',
      'Water pollution from upstream agriculture',
    ],
    conservation:
      'Protecting rivers and wetlands benefits hippos and people alike. Kenya Wildlife Service patrols, riparian corridor protection and community water-user associations are helping keep the country\'s main hippo populations stable.',
  },
  {
    id: 7,
    name: 'Rhinoceros',
    emoji: '🦏',
    bigFive: true,
    scientific: 'Diceros bicornis',
    status: 'Critically Endangered',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI0AQm2tjfcJ--dbYt3GmEpKnPipQpyVOgrfqEHWDzyg&s=10',
    tagline: 'An armoured survivor on the edge.',
    habitat: 'Savanna, Bushland, Dry woodland',
    diet: 'Browser — leaves, twigs, shoots and shrubs',
    weight: '800 – 1,400 kg',
    height: '1.4 – 1.8 m at the shoulder',
    lifespan: '35 – 50 years',
    speed: '55 km/h',
    population: '≈ 6,200 black rhinos remaining',
    range: 'Kenya strongholds: Ol Pejeta, Lewa, Nairobi NP, Tsavo & Meru',
    overview:
      'The black rhinoceros is actually grey — the name comes from the shape of its lip. It is a browser with a prehensile upper lip that works like a short trunk, hooking leaves and twigs from bushes. Rhinos have poor eyesight but an outstanding sense of smell and hearing, and can spin around and charge at remarkable speed.',
    behaviour:
      'Black rhinos are largely solitary and use communal dung middens to communicate, each animal leaving its own scent signature. Females and calves stay together for several years. Rhinos are most active in the cool of early morning and evening, resting in shade during the heat of the day.',
    facts: [
      'A rhino\'s horn is made of keratin — the same material as human hair and fingernails.',
      'Black rhinos have two horns; the front one can grow to 1.3 m.',
      'Their upper lip is prehensile and used like a finger to pull leaves from bushes.',
      'They wallow in mud to cool down and to protect their skin from parasites.',
      'Kenya is one of the last strongholds for the eastern black rhino subspecies.',
    ],
    threats: [
      'Poaching for horn, driven by illegal international markets',
      'Very small, isolated populations',
      'Habitat loss to settlements and grazing',
      'Low breeding rates and inbreeding risk',
    ],
    conservation:
      'Kenya\'s black rhino population has more than doubled since the 1990s thanks to intensive protection in fenced sanctuaries such as Ol Pejeta, Lewa and Nairobi National Park. Every reported sighting, snare or suspicious vehicle helps rangers protect these animals. Rhino conservation is one of the clearest success stories in African wildlife — but it depends entirely on constant vigilance.',
  },
  {
    id: 8,
    name: 'African Buffalo',
    emoji: '🐃',
    bigFive: true,
    scientific: 'Syncerus caffer',
    status: 'Near Threatened',
    /* ✅ Fixed — image source restored */
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC4uLwKDQNuHZQDkpdynhO_oFqhyuP0qMRO-JqfnWrXw&s=10',
    tagline: 'The herd that votes — and never backs down.',
    habitat: 'Savanna, Grassland, Forest, Swamps',
    diet: 'Grazer — tall grasses and sedges',
    weight: '500 – 900 kg',
    height: '1.4 – 1.7 m at the shoulder',
    lifespan: '20 – 25 years',
    speed: '57 km/h',
    population: '≈ 830,000 across Africa',
    range: 'Sub-Saharan Africa — the Maasai Mara, Tsavo and Amboseli',
    overview:
      'The African buffalo is a massive, powerful bovid and the only wild cattle species on the continent. It is one of the "Big Five" and has a fearsome reputation: wounded or cornered animals will charge without hesitation, and herds will sometimes come back to rescue a calf or a fallen herd-mate from predators.',
    behaviour:
      'Buffaloes live in large herds that can number in the hundreds. When a herd is undecided about which way to move, individuals stand up, look in their preferred direction, and then lie back down — a behaviour that looks remarkably like voting. Older bulls that no longer keep up with the herd become solitary or form small groups known as "dagga boys".',
    facts: [
      'Buffalo herds appear to "vote" on the direction they should travel.',
      'A herd will often return to defend a calf from lions or hyenas.',
      'Old solitary males are called "dagga boys", from the Shona word for mud.',
      'Their horns form a continuous bony shield called a boss across the forehead.',
      'Buffaloes never stray far from water and must drink daily.',
    ],
    threats: [
      'Habitat loss and competition with cattle',
      'Bushmeat poaching',
      'Diseases such as bovine tuberculosis and foot-and-mouth',
      'Drought reducing grazing and water',
    ],
    conservation:
      'Buffaloes remain the most numerous of the Big Five and are relatively secure in well-protected landscapes. Their main risk is the fragmentation of rangeland. Community conservancies that maintain open corridors between parks are essential for keeping herds — and the predators that depend on them — healthy.',
  },
  /* ==============================================================
     ✅ NEW — HIROLA  (Kenya's most endangered large mammal)
     No reliable hot-linkable photo exists, so the card intentionally
     uses the built-in emoji fallback (🦌 + "Hirola" label) rather
     than risk showing the wrong animal. Drop in your own photo URL
     later if you have one — the field is optional.
     ============================================================== */
  {
    id: 9,
    name: 'Hirola',
    emoji: '🦌',
    bigFive: false,
    scientific: 'Beatragus hunteri',
    status: 'Critically Endangered',
   image: 'https://s3.animalia.bio/animals/photos/full/1.25x1/shutterstock-1626292537jpg.webp?id=aea61b6f2991977fdf91a2bfd4ff1da5',
    tagline: 'The world\'s rarest antelope — and it lives only in Kenya.',
    habitat: 'Dry acacia grassland, Open bushland, Semi-arid plains',
    diet: 'Grazer — short grasses, herbs, occasionally browse',
    weight: '80 – 118 kg',
    height: 'About 1.0 – 1.25 m at the shoulder',
    lifespan: '10 – 15 years in the wild',
    speed: '≈ 60 km/h',
    population: 'Fewer than 500 individuals remaining worldwide',
    range: 'Kenya only — Garissa, Ijara, Fafi, Bura and the Boni–Dodori forest edges',
    overview:
      'The hirola — also called Hunter\'s hartebeest — is one of the rarest and most endangered antelopes on Earth, and it is found nowhere else on the planet except a small corner of north-eastern Kenya along the Somali border. Once numbering perhaps 14,000 animals in the 1970s, its population has collapsed by more than 90% and today fewer than 500 survive. The hirola is the only living member of its genus, making it genetically irreplaceable — if it disappears, an entire branch of the antelope family tree goes with it.',
    behaviour:
      'Hirola live in small, loose herds of five to forty animals, often led by a single dominant female rather than a male — a rare social structure among antelopes. They are unusually social with other species and are frequently seen grazing alongside zebras, oryx and Grant\'s gazelles, which may help them detect predators. Females give birth to a single calf after about eight months and can breed year-round, though calf survival is very low because of predation and disease. Hirola are diurnal, grazing in the cool of early morning and late afternoon and resting in shade during the heat of the day.',
    facts: [
      'The hirola is the sole surviving member of the genus Beatragus — it has no close living relatives.',
      'Its most distinctive feature is a pair of white "spectacle" markings around the eyes, connected by a thin white line across the forehead.',
      'Hirola horns are strongly ridged and lyre-shaped, curving outwards and then back in.',
      'It was discovered by the Scottish explorer and hunter H. C. V. Hunter in 1888 and is also called Hunter\'s hartebeest.',
      'Fewer than 500 remain — making it rarer than the black rhino and roughly as rare as the mountain gorilla.',
    ],
    threats: [
      'Extremely small, isolated population',
      'Loss of grassland to overgrazing, drought and bush encroachment',
      'Predation of calves by lions, cheetahs, hyenas and wild dogs',
      'Disease outbreaks, especially rinderpest and trypanosomiasis',
      'Habitat fragmentation and competition with livestock',
      'Climate change intensifying drought in the Horn of Africa',
    ],
    conservation:
      'The hirola is protected under Kenyan law and listed as Critically Endangered on the IUCN Red List. Conservation relies on a small number of dedicated efforts: the Hirola Conservation Programme works with local Somali communities in Garissa and Ijara to protect calving grounds, restore grassland and run ranger patrols; the Ishaqbini Hirola Community Conservancy — the world\'s first community conservancy created specifically to save a single species — now shelters one of the last viable populations behind a predator-proof sanctuary fence. Around 2,000 community members are directly involved in hirola protection. Every sighting you report matters enormously: with so few animals left, even a single observation can inform where rangers and researchers focus next.',
  },
];

/* Status → colour mapping (cards + detail view) */
const STATUS_BADGE = {
  'Critically Endangered': 'bg-red-600/85 text-white',
  'Endangered': 'bg-orange-500/85 text-white',
  'Vulnerable': 'bg-yellow-500/85 text-white',
  'Near Threatened': 'bg-lime-600/85 text-white',
  'Least Concern': 'bg-green-600/85 text-white',
};

const STATUS_DOT = {
  'Critically Endangered': 'bg-red-500',
  'Endangered': 'bg-orange-500',
  'Vulnerable': 'bg-yellow-500',
  'Near Threatened': 'bg-lime-500',
  'Least Concern': 'bg-green-500',
};

/* ==================================================================
   IMAGE WITH MATCHING FALLBACK
   If a photo fails to load — or was never provided — we render a
   tile built from that species' own emoji + name, so a card can
   never display the wrong animal.
   ================================================================== */
const AnimalImage = ({ species, className = '', imgClassName = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !species.image) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-950`}
      >
        <span className="text-6xl drop-shadow-lg">{species.emoji}</span>
        <span className="mt-2 px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-white/80">
          {species.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={species.image}
      alt={species.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} ${imgClassName}`}
    />
  );
};

/* ==================================================================
   DETAIL MODAL  — opened by "Learn more"
   ================================================================== */
const SpeciesDetail = ({ species, onClose }) => {
  /* Escape key + body scroll lock */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const quickFacts = [
    { icon: '🔬', label: 'Scientific name', value: species.scientific },
    { icon: '🌍', label: 'Habitat', value: species.habitat },
    { icon: '🍽️', label: 'Diet', value: species.diet },
    { icon: '⚖️', label: 'Weight', value: species.weight },
    { icon: '📏', label: 'Height', value: species.height },
    { icon: '⏳', label: 'Lifespan', value: species.lifespan },
    { icon: '⚡', label: 'Top speed', value: species.speed },
    { icon: '📊', label: 'Population', value: species.population },
    { icon: '🗺️', label: 'Range', value: species.range },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${species.name} details`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl"
      >
        {/* ---------- Header image ---------- */}
        <div className="relative h-52 w-full shrink-0 sm:h-72">
          <AnimalImage
            species={species}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close details"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Name + status */}
          <div className="absolute bottom-0 left-0 w-full p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  STATUS_BADGE[species.status] || 'bg-green-600/85 text-white'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                {species.status}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                {species.bigFive ? '⭐ Big Five' : '🔎 Species Profile'}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-4xl">
              {species.emoji} {species.name}
            </h2>
            <p className="mt-1 text-sm italic text-white/80 sm:text-base">
              {species.scientific}
            </p>
          </div>
        </div>

        {/* ---------- Scrollable body ---------- */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          {/* Tagline */}
          <p className="text-base font-semibold text-emerald-800 sm:text-lg">
            {species.tagline}
          </p>

          {/* Quick facts grid */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50"
              >
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <span className="text-sm">{fact.icon}</span>
                  {fact.label}
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-gray-800">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          {/* Overview */}
          <section className="mt-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-green-600 to-emerald-400" />
              Overview
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
              {species.overview}
            </p>
          </section>

          {/* Behaviour */}
          <section className="mt-7">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-green-600 to-emerald-400" />
              Behaviour &amp; Social Life
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
              {species.behaviour}
            </p>
          </section>

          {/* Did you know */}
          <section className="mt-7">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-green-600 to-emerald-400" />
              Did you know?
            </h3>
            <ul className="mt-3 space-y-2.5">
              {species.facts.map((fact, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Threats */}
          <section className="mt-7">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-red-500 to-orange-400" />
              Threats
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {species.threats.map((threat, i) => (
                <span
                  key={i}
                  className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
                >
                  {threat}
                </span>
              ))}
            </div>
          </section>

          {/* Conservation */}
          <section className="mt-7">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-green-600 to-emerald-400" />
              Conservation &amp; How You Can Help
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
              {species.conservation}
            </p>
          </section>

          {/* Actions */}
          <div className="mt-9 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
            <Link
              to="/report"
              onClick={onClose}
              className="flex-1 rounded-full bg-gradient-to-r from-green-700 to-green-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition hover:from-green-800 hover:to-green-700"
            >
              Report a Sighting or Incident
            </Link>
            <button
              onClick={onClose}
              className="flex-1 rounded-full border-2 border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-700"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ==================================================================
   MAIN PAGE
   ================================================================== */
const Wildlife = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  /* Filter across every meaningful field */
  const filteredSpecies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return SPECIES_DATA;

    return SPECIES_DATA.filter((s) =>
      [
        s.name,
        s.scientific,
        s.habitat,
        s.status,
        s.diet,
        s.range,
        s.tagline,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [searchTerm]);

  const closeDetail = useCallback(() => setSelectedSpecies(null), []);

  /* Animation variants */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const heroTextVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden lg:min-h-[65vh]">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-emerald-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.3)_70%)]" />

        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse-slow rounded-full bg-emerald-500/10 blur-3xl" />
        <div
          className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-pulse-slow rounded-full bg-green-400/10 blur-3xl"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            variants={heroTextVariants}
            className="mx-auto max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Wildlife Encyclopedia
            </motion.div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
              Kenya's{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                Wildlife
              </span>{' '}
              <br />
              Diversity
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 drop-shadow sm:text-lg md:text-xl">
              Discover the incredible species that call Northern Kenya home – from the majestic
              elephant to the elusive cheetah. Tap <strong className="font-semibold text-white">Learn more</strong>{' '}
              on any card for the full profile.
            </p>

            {/* Search */}
            <div className="relative mx-auto mt-8 max-w-xl">
              <input
                type="text"
                placeholder="Search by name, scientific name, or habitat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-white/20 bg-white/10 py-3 pl-12 pr-12 text-white placeholder-white/50 shadow-lg backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/60">
              <span className="text-lg font-bold text-white">{SPECIES_DATA.length}</span>
              <span>Species listed</span>
              <span className="h-6 w-px bg-white/20" />
              <span className="flex items-center gap-1">
                <span className="text-emerald-400">●</span> Live data
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SPECIES GRID ===== */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Species
            </span>
            <h2 className="mt-2 text-3xl font-bold text-gray-800 md:text-4xl">
              {searchTerm ? `Results for "${searchTerm}"` : 'Explore Our Wildlife'}
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-green-600 to-emerald-500" />
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              {filteredSpecies.length}{' '}
              {filteredSpecies.length === 1 ? 'species' : 'species'} found
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredSpecies.map((species) => (
              <motion.article
                key={species.id}
                variants={itemVariants}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-green-200 hover:shadow-2xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <AnimalImage
                    species={species}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                        STATUS_BADGE[species.status] || 'bg-green-500/80 text-white'
                      }`}
                    >
                      {species.status}
                    </span>
                  </div>
                  {species.bigFive && (
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-amber-200 backdrop-blur-sm">
                        ⭐ Big Five
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-gray-800">
                    {species.emoji} {species.name}
                  </h3>
                  <p className="text-sm italic text-gray-500">{species.scientific}</p>
                  <p className="mt-2 flex-1 text-sm text-gray-600">{species.tagline}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      🌍 {species.habitat.split(',')[0]}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      ⚖️ {species.weight.split('(')[0].split('–')[0].trim()}
                    </span>
                  </div>

                  {/* Learn more — opens the in-page detail panel */}
                  <button
                    type="button"
                    onClick={() => setSelectedSpecies(species)}
                    className="mt-4 inline-flex items-center gap-1 self-start text-sm font-medium text-green-700 transition-colors hover:text-green-800 group-hover:gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  >
                    Learn More
                    <svg
                      className="h-3 w-3 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {filteredSpecies.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-500">
                No species found matching your search.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 font-medium text-green-700 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-white py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-green-100/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <span className="mb-4 inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
              Get Involved
            </span>
            <h2 className="text-3xl font-bold leading-tight text-gray-800 md:text-4xl lg:text-5xl">
              Help Protect These Species
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Report sightings, conflicts, or poaching incidents to help us keep wildlife safe.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/report"
                className="transform rounded-full bg-gradient-to-r from-green-700 to-green-600 px-10 py-4 font-semibold text-white shadow-2xl shadow-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:from-green-800 hover:to-green-700 hover:shadow-green-600/50"
              >
                Report an Incident
              </Link>
              <Link
                to="/register"
                className="transform rounded-full border-2 border-green-700 bg-white px-10 py-4 font-semibold text-green-700 transition-all duration-300 hover:-translate-y-1 hover:bg-green-50 hover:shadow-lg"
              >
                Sign Up for Updates
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800 bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
            <div>
              <div className="flex items-center gap-3">
                <img src={logo} alt="WildNorth Kenya" className="h-10 w-10 object-contain" />
                <span className="text-xl font-bold text-white">WildNorth Kenya</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
                Protecting wildlife through community action, technology, and education across
                Northern Kenya.
              </p>
              <div className="mt-4 flex gap-3">
                {['🐘', '🦒', '🦁', '🦓'].map((emoji, i) => (
                  <span
                    key={i}
                    className="cursor-default text-xl opacity-60 transition-opacity hover:opacity-100"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/about" className="transition-colors hover:text-green-400">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/report" className="transition-colors hover:text-green-400">
                    Report Incident
                  </Link>
                </li>
                <li>
                  <Link to="/wildlife" className="transition-colors hover:text-green-400">
                    Wildlife
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition-colors hover:text-green-400">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/news" className="transition-colors hover:text-green-400">
                    News
                  </Link>
                </li>
                <li>
                  <Link to="/map" className="transition-colors hover:text-green-400">
                    Interactive Map
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="transition-colors hover:text-green-400">
                    Community Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="transition-colors hover:text-green-400">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Connect</h4>
              <div className="space-y-2.5 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-green-400">📍</span> Garissa, Kenya
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-400">📞</span> +254 (0) 728 252 288
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-400">✉️</span> info@wildnorthkenya.org
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                {['🐦', '📘', '📸', '▶️'].map((icon, i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-sm transition-all hover:bg-green-700 hover:text-white"
                  >
                    {icon}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} WildNorth Kenya. All rights reserved. Made with ❤️
            for conservation.
          </div>
        </div>
      </footer>

      {/* ===== DETAIL OVERLAY ===== */}
      <AnimatePresence>
        {selectedSpecies && (
          <SpeciesDetail species={selectedSpecies} onClose={closeDetail} />
        )}
      </AnimatePresence>

      {/* ===== CUSTOM ANIMATIONS ===== */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Wildlife;