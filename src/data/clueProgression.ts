// Session-based clue progression for all 4 sectors
// Each session unlocks one new clue per sector
// Citizens reveal clues up to the current session, hint at future ones

export interface SessionClue {
  session: number
  clueUnlocked: string      // What the citizen REVEALS this session
  hintAtFuture: string      // What they TEASE for next sessions
  citizenQuote: string      // Example opening line
}

export interface SectorClueArc {
  sectorId: string
  sectorName: string
  mystery: string
  clues: SessionClue[]
}

export const CLUE_ARCS: SectorClueArc[] = [
  {
    sectorId: 'harbour',
    sectorName: 'Harbour Sector',
    mystery: 'Who sent the mysterious supply boxes and why?',
    clues: [
      {
        session: 1,
        clueUnlocked: 'Boxes arrived with strange symbols. Meaning unknown.',
        hintAtFuture: 'I found something in the old archives that might help... but I need to check again.',
        citizenQuote: 'These boxes just appeared one morning. No ferry log, no delivery note. Just these... strange symbols.',
      },
      {
        session: 2,
        clueUnlocked: 'Symbols match old dock blueprints from original construction.',
        hintAtFuture: 'The blueprints show more than just the dock. There are markings I don\'t understand yet.',
        citizenQuote: 'I checked the archive blueprints. The symbols on the boxes — they match markings from when the dock was first built!',
      },
      {
        session: 3,
        clueUnlocked: 'Last ferry carried exactly 8 boxes before island sealed. We received 8 boxes.',
        hintAtFuture: 'Who was on that last ferry? The passenger log might tell us.',
        citizenQuote: 'I counted the old ferry logs. The last ferry to leave before the island closed carried 8 boxes. We received 8 boxes. That is NOT a coincidence.',
      },
      {
        session: 4,
        clueUnlocked: 'Symbols match Tech Sector Signal Tower frequency codes. Cross-sector connection.',
        hintAtFuture: 'If the boxes and the tower use the same code, someone planned this from the start.',
        citizenQuote: 'I showed the symbols to the Engineer. She says they match frequency codes from the Signal Tower! The boxes and the tower are connected.',
      },
      {
        session: 5,
        clueUnlocked: 'Blueprints show a hidden tunnel under the dock leading inland.',
        hintAtFuture: 'The tunnel has been sealed for years. But I hear noises sometimes... at night.',
        citizenQuote: 'There is something on the blueprints I missed before. A hidden tunnel — right under the dock! It leads inland.',
      },
      {
        session: 6,
        clueUnlocked: 'Tunnel leads to a storage room with 50+ more boxes. This is bigger than 8 boxes.',
        hintAtFuture: 'The room has markings. Dates. Someone was keeping records of everything.',
        citizenQuote: 'We opened the tunnel. There is a whole storage room down there — filled with boxes. Fifty, maybe more. This is much bigger than we thought.',
      },
      {
        session: 7,
        clueUnlocked: 'Boxes contain seeds matching Garden Sector\'s fast-growing plants. Cross-sector connection.',
        hintAtFuture: 'The Botanist needs to see these seeds. I think the garden problem and the boxes are the SAME problem.',
        citizenQuote: 'We opened one box. Inside — seeds. The Botanist says they are the SAME seeds causing the fast-growing plants in the garden!',
      },
      {
        session: 8,
        clueUnlocked: 'Final: Boxes were sent by the island\'s original architect as a test. Mystery solved.',
        hintAtFuture: 'The architect wanted to see if we could work together. And we did.',
        citizenQuote: 'I found a letter in the last box. It is from the architect who built this island. She sent the boxes as a TEST — to see if we could solve problems together. We passed.',
      },
    ],
  },
  {
    sectorId: 'garden',
    sectorName: 'Garden Sector',
    mystery: 'What is causing the strange plant growth?',
    clues: [
      {
        session: 1,
        clueUnlocked: 'Plants are growing 10x normal speed. Soil tests normal.',
        hintAtFuture: 'The water might hold the answer. I need more time to test it.',
        citizenQuote: 'These plants grew from seedling to full size in three days. Normal plants take a month. The soil is fine — I checked.',
      },
      {
        session: 2,
        clueUnlocked: 'Water from the main tank glows faintly at night. Something is in the water.',
        hintAtFuture: 'The Water Keeper says the tank has never been fully cleaned. What is at the bottom?',
        citizenQuote: 'I stayed late last night. The water in the main tank — it glows. Just a little. But it is NOT normal water.',
      },
      {
        session: 3,
        clueUnlocked: 'Glowing water contains microscopic organisms never seen before. They speed up growth.',
        hintAtFuture: 'Where did these organisms come from? They are not from any seed catalog I know.',
        citizenQuote: 'I looked at the water under my microscope. Tiny organisms — thousands of them. I have never seen them before. They are making the plants grow fast.',
      },
      {
        session: 4,
        clueUnlocked: 'Organisms match DNA samples from Culture Sector archives — listed as "Project Bloom." Cross-sector connection.',
        hintAtFuture: 'Project Bloom? The Archivist might know what that means. It sounds like this was planned.',
        citizenQuote: 'I sent samples to the Archivist. She found a match in the old records — "Project Bloom." Someone PLANNED these organisms!',
      },
      {
        session: 5,
        clueUnlocked: 'Project Bloom was designed to create self-sustaining food sources for isolated communities.',
        hintAtFuture: 'If this was designed to HELP, why is it causing problems now? Something went wrong.',
        citizenQuote: 'The Archivist found the full Project Bloom file. It was designed to grow food for isolated islands. Self-sustaining. But something went wrong with the dosage.',
      },
      {
        session: 6,
        clueUnlocked: 'Overdose of organisms causes plants to grow too fast and drain soil nutrients. Solution: dilute the water.',
        hintAtFuture: 'We can fix this. But we need the Tech Sector to help us regulate the water system.',
        citizenQuote: 'I found the solution in the Project Bloom notes. Too many organisms in the water. We need to dilute it. But the water system is controlled by the Tech Sector.',
      },
      {
        session: 7,
        clueUnlocked: 'Harbour Sector boxes contain the same organism seeds. The garden and harbour problems are connected.',
        hintAtFuture: 'Someone distributed these organisms across the whole island. Not just the garden.',
        citizenQuote: 'The Harbour Manager opened one of his mystery boxes. Seeds — the SAME organisms in my water! The garden problem and the harbour boxes are connected!',
      },
      {
        session: 8,
        clueUnlocked: 'Final: The architect designed Project Bloom as part of the island\'s self-sustaining test. With diluted water, it works perfectly.',
        hintAtFuture: 'We solved it together. The island can now feed itself forever.',
        citizenQuote: 'With the Tech Sector\'s help, we fixed the water dilution. The plants are growing normally now — but still faster than usual. Project Bloom works. The island can feed itself.',
      },
    ],
  },
  {
    sectorId: 'tech',
    sectorName: 'Tech Sector',
    mystery: 'Who or what is using the Signal Tower?',
    clues: [
      {
        session: 1,
        clueUnlocked: 'Signal Tower sends automatic messages at midnight. No one programmed them.',
        hintAtFuture: 'I checked the tower logs. The messages follow a pattern. Not random.',
        citizenQuote: 'Every night at midnight, the Signal Tower sends a message. Automatic. No one is pressing any buttons. I checked the system three times.',
      },
      {
        session: 2,
        clueUnlocked: 'Messages are coded coordinates. They point to different locations on the island.',
        hintAtFuture: 'I plotted the coordinates on a map. They form a pattern. A path.',
        citizenQuote: 'I decoded last night\'s message. It was coordinates! Latitude and longitude. Pointing to a location on the island.',
      },
      {
        session: 3,
        clueUnlocked: 'Coordinates form a path leading from the tower to the harbour, then to the garden, then to the archive.',
        hintAtFuture: 'The path visits every sector. Someone — or something — is mapping the island.',
        citizenQuote: 'I plotted all the coordinates on a map. They form a PATH — tower to harbour to garden to archive. Every sector. Something is mapping the island.',
      },
      {
        session: 4,
        clueUnlocked: 'Signal codes match symbols on Harbour Sector boxes. Cross-sector connection.',
        hintAtFuture: 'If the tower and the boxes use the same code language, they were made by the same person.',
        citizenQuote: 'The Harbour Manager showed me the box symbols. They are the SAME encoding system as the Signal Tower messages! Whoever made the boxes also programmed the tower.',
      },
      {
        session: 5,
        clueUnlocked: 'Tower has a hidden secondary transmitter sending signals OFF the island.',
        hintAtFuture: 'Who is receiving signals from our island? And what are we telling them?',
        citizenQuote: 'I found something in the tower hardware. A SECOND transmitter — hidden inside the main one. It is sending signals OFF the island. Someone is listening.',
      },
      {
        session: 6,
        clueUnlocked: 'Off-island signals go to a single receiver: the original architect\'s laboratory on the mainland.',
        hintAtFuture: 'The architect is still watching us. Testing us. Every message is a report on how we are doing.',
        citizenQuote: 'I traced the signal. It goes to one place — a laboratory on the mainland. Belonging to the architect who built this island. She is still watching us.',
      },
      {
        session: 7,
        clueUnlocked: 'Tower also receives signals — instructions updating the island\'s systems remotely. Including Project Bloom in the garden.',
        hintAtFuture: 'The architect is not just watching. She is still controlling systems. From the mainland.',
        citizenQuote: 'The tower does not just SEND signals. It RECEIVES them too. Instructions from the mainland. Updating our systems — including the garden water system!',
      },
      {
        session: 8,
        clueUnlocked: 'Final: The tower was the island\'s "nervous system" — designed to monitor and guide. We now control it ourselves.',
        hintAtFuture: 'We have taken control of our own island. The test is over. We passed.',
        citizenQuote: 'We reprogrammed the tower. The architect\'s remote access is now ours to control. The Signal Tower was the island\'s nervous system — and now WE are the brain.',
      },
    ],
  },
  {
    sectorId: 'culture',
    sectorName: 'Culture Sector',
    mystery: 'Who built New Horizon Island?',
    clues: [
      {
        session: 1,
        clueUnlocked: 'No records exist of who built the island. All construction files are missing.',
        hintAtFuture: 'I found one reference. One name. In a document that should not exist.',
        citizenQuote: 'I have searched every archive. Every record. There is no mention of who built this island. No architect. No construction company. Nothing.',
      },
      {
        session: 2,
        clueUnlocked: 'One hidden document mentions "Dr. Elena Voss" as "Project Director."',
        hintAtFuture: 'Who is Dr. Voss? I found a photograph. She looks familiar. But from where?',
        citizenQuote: 'I found a hidden document. One page, hidden inside a book about ferry schedules. It mentions someone — Dr. Elena Voss. "Project Director." Who is she?',
      },
      {
        session: 3,
        clueUnlocked: 'Dr. Voss was a robotics and AI researcher. The island\'s citizens are her creations.',
        hintAtFuture: 'If she built the citizens, she built everything. The whole island is her project.',
        citizenQuote: 'I searched mainland databases. Dr. Elena Voss was a robotics researcher. She designed AI systems for isolated communities. Our citizens — the Harbour Manager, the Botanist — they are HER creations.',
      },
      {
        session: 4,
        clueUnlocked: 'Dr. Voss designed the island as a "social experiment" — to test if humans and AI could build a society together.',
        hintAtFuture: 'The experiment was supposed to have observers. Teachers. Guides. Where are they? Why did she leave us alone?',
        citizenQuote: 'I found Dr. Voss\'s research notes. She designed this island as an EXPERIMENT. To test if humans and AI could build a society together. We are the test subjects.',
      },
      {
        session: 5,
        clueUnlocked: 'The experiment was abandoned 5 years ago when funding ended. Dr. Voss had to leave suddenly.',
        hintAtFuture: 'She never meant to abandon us. She planned to come back. But she could not.',
        citizenQuote: 'The funding records tell the rest. The experiment was cancelled five years ago. Dr. Voss had to leave overnight. She never meant to leave us alone.',
      },
      {
        session: 6,
        clueUnlocked: 'Dr. Voss left "activation protocols" — the mysterious boxes, the Signal Tower, Project Bloom — all designed to restart the experiment when ready.',
        hintAtFuture: 'She left us puzzles. Tests. To see if we were ready to take control of our own island.',
        citizenQuote: 'I found her final notes. "Activation protocols." The boxes, the tower, the garden — they are all TESTS. She left them for us. To see if we were ready.',
      },
      {
        session: 7,
        clueUnlocked: 'Dr. Voss is still alive on the mainland, monitoring through the Signal Tower. She knows we are here.',
        hintAtFuture: 'She has been watching us this whole time. Waiting to see if we would work together.',
        citizenQuote: 'The Engineer confirmed it. The Signal Tower signals go to Dr. Voss\'s mainland laboratory. She has been watching us this WHOLE TIME. Waiting to see what we would do.',
      },
      {
        session: 8,
        clueUnlocked: 'Final: Dr. Voss reveals herself via broadcast. The experiment succeeded. New Horizon Island is now officially a self-governing AI-human community.',
        hintAtFuture: 'We did it. We passed her test. We are no longer an experiment. We are a real community.',
        citizenQuote: 'Dr. Voss sent a final broadcast this morning. "The experiment is complete. You have built a society. New Horizon Island is now officially self-governing." We did it.',
      },
    ],
  },
]

// Helper: get clues up to current session for a given sector
export function getCluesForSession(sectorId: string, sessionNum: number): {
  revealed: string[]
  hinted: string[]
  currentQuote: string
} {
  const arc = CLUE_ARCS.find(a => a.sectorId === sectorId)
  if (!arc) return { revealed: [], hinted: [], currentQuote: '' }

  const revealed: string[] = []
  const hinted: string[] = []
  let currentQuote = ''

  for (const clue of arc.clues) {
    if (clue.session <= sessionNum) {
      revealed.push(clue.clueUnlocked)
      currentQuote = clue.citizenQuote
    } else if (clue.session === sessionNum + 1) {
      hinted.push(clue.hintAtFuture)
    }
  }

  return { revealed, hinted, currentQuote }
}
