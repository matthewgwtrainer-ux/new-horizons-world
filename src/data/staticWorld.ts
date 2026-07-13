// Static data layer - all world content embedded for static deployment
// When backend is available, tRPC API takes over. Otherwise, this data loads instantly.

export interface StaticSector {
  id: number;
  sectorId: string;
  name: string;
  displayOrder: number;
  responsibility: string;
  locations: string;
  citizens: string;
  currentProblem: string;
  mystery: string;
  status: string;
}

export interface StaticTeam {
  id: number;
  teamId: string;
  name: string;
  sectorId: string;
  members: string;
  currentTask: string;
  status: string;
}

export interface StaticSession {
  id: number;
  sessionId: number;
  title: string;
  worldUpdate: string;
  mainProblem: string;
  wholeClassGoal: string;
  teamTask: string;
  status: string;
}

export interface StaticLog {
  id: number;
  sessionId: number;
  sectorId: string;
  type: string;
  entry: string;
  addedBy: string;
  visibility: string;
  createdAt: string;
}

export interface StaticTemplate {
  id: number;
  templateId: string;
  category: string;
  sentenceStarter: string;
  example: string;
}

export interface StaticReport {
  id: number;
  sessionId: number;
  teamId: string;
  sectorId: string;
  reportType: string;
  title: string;
  content: string;
  status: string;
  teacherComment: string | null;
  createdAt: string;
}

export interface StaticWorld {
  id: number;
  name: string;
  code: string;
  tagline: string;
  currentSession: number;
  teacherPasscode: string;
  mode: string;
}

export const staticWorld: StaticWorld = {
  id: 1,
  name: "New Horizon Island",
  code: "NHI2026",
  tagline: "Can our English make an AI world come alive?",
  currentSession: 1,
  teacherPasscode: "worldcouncil",
  mode: "TEST",
};

export const staticSectors: StaticSector[] = [
  {
    id: 1, sectorId: "harbour", name: "Harbour Sector", displayOrder: 1,
    responsibility: "Transport, supplies, visitors, trade",
    locations: "Main Dock; Ferry Gate; Supply Warehouse",
    citizens: "Harbour Manager; Ferry Pilot; Supply Robot",
    currentProblem: "Supply boxes arrived with no sender.",
    mystery: "Who sent the boxes and why?",
    status: "Active",
  },
  {
    id: 2, sectorId: "garden", name: "Garden Sector", displayOrder: 2,
    responsibility: "Food, water, plants, animals, health",
    locations: "Greenhouse; Water Tank; Animal Shelter",
    citizens: "Botanist; Water Keeper; Animal Helper",
    currentProblem: "Plants are growing too fast.",
    mystery: "What is causing the strange growth?",
    status: "Active",
  },
  {
    id: 3, sectorId: "tech", name: "Tech Sector", displayOrder: 3,
    responsibility: "Power, robots, communication, repairs",
    locations: "Signal Tower; Robot Garage; Power Station",
    citizens: "Engineer; Repair Robot; Signal Officer",
    currentProblem: "Signal Tower sends messages by itself.",
    mystery: "Who or what is using the tower?",
    status: "Active",
  },
  {
    id: 4, sectorId: "culture", name: "Culture Sector", displayOrder: 4,
    responsibility: "History, citizens, news, rules",
    locations: "Council Hall; Archive Room; Newsroom",
    citizens: "Archivist; Young Reporter; Council Guide",
    currentProblem: "Nobody knows who built the island.",
    mystery: "Who built New Horizon Island?",
    status: "Active",
  },
];

export const staticTeams: StaticTeam[] = [
  { id: 1, teamId: "T1", name: "Harbour Team", sectorId: "harbour", members: "", currentTask: "Investigate the mystery boxes.", status: "Active" },
  { id: 2, teamId: "T2", name: "Garden Team", sectorId: "garden", members: "", currentTask: "Investigate the fast-growing plants.", status: "Active" },
  { id: 3, teamId: "T3", name: "Tech Team", sectorId: "tech", members: "", currentTask: "Investigate the strange signal tower.", status: "Active" },
  { id: 4, teamId: "T4", name: "Culture Team", sectorId: "culture", members: "", currentTask: "Investigate the island's lost history.", status: "Active" },
];

export const staticSessions: StaticSession[] = [
  {
    id: 1, sessionId: 1, title: "Arrival at New Horizon Island",
    worldUpdate: "The World Council has invited your teams to inspect a new AI island near Hong Kong. Four sectors are working, but strange problems have already appeared.",
    mainProblem: "Each sector has a mystery. The island cannot open to visitors until the teams investigate and report clearly.",
    wholeClassGoal: "Use English to question AI citizens, collect evidence, and make a first World Council report.",
    teamTask: "Click your sector, read the problem, build a prompt, question an AI citizen, then write a short report.",
    status: "Active",
  },
  {
    id: 2, sessionId: 2, title: "Meet the Citizens",
    worldUpdate: "The AI citizens are becoming more talkative. Some have started leaving messages for the World Council teams.",
    mainProblem: "Citizens know more than they are saying. Teams must ask the right questions.",
    wholeClassGoal: "Interview AI citizens and collect character profiles.",
    teamTask: "Choose a citizen. Build a prompt. Interview them and record what you learn.",
    status: "Active",
  },
  {
    id: 3, sessionId: 3, title: "First Sector Problems",
    worldUpdate: "The mysteries are deepening. New clues have appeared in each sector.",
    mainProblem: "Problems are connected across sectors. Teams must share information.",
    wholeClassGoal: "Investigate local issues and propose solutions.",
    teamTask: "Write a problem report with evidence and a recommended solution.",
    status: "Active",
  },
  {
    id: 4, sessionId: 4, title: "World Council Meeting",
    worldUpdate: "The World Council has called an emergency meeting. Teams must present their findings.",
    mainProblem: "Evidence from all sectors points to a bigger mystery.",
    wholeClassGoal: "Present evidence, negotiate, and make joint decisions.",
    teamTask: "Prepare a council presentation. Explain your evidence and recommend action.",
    status: "Active",
  },
  {
    id: 5, sessionId: 5, title: "Island Development",
    worldUpdate: "With mysteries partially solved, teams can now propose improvements to their sectors.",
    mainProblem: "What improvements does each sector need?",
    wholeClassGoal: "Propose improvements with reasons and predicted consequences.",
    teamTask: "Write an improvement proposal. Explain why it helps and what might happen.",
    status: "Active",
  },
  {
    id: 6, sessionId: 6, title: "Newsroom Day",
    worldUpdate: "The island's first newspaper is being launched. Teams become journalists.",
    mainProblem: "Turn world events into clear news reports and headlines.",
    wholeClassGoal: "Write news articles and blog posts about island events.",
    teamTask: "Write a news article with a headline, lead paragraph, and body.",
    status: "Active",
  },
  {
    id: 7, sessionId: 7, title: "Broadcast Preparation",
    worldUpdate: "The island is ready for its first live news broadcast.",
    mainProblem: "Teams must write and rehearse a Day C-style news script.",
    wholeClassGoal: "Prepare broadcast scripts and assign roles.",
    teamTask: "Write a broadcast script with anchor, reporter, and interview segments.",
    status: "Active",
  },
  {
    id: 8, sessionId: 8, title: "Final Broadcast and Reflection",
    worldUpdate: "It's broadcast day! Teams present their final news show.",
    mainProblem: "Deliver a polished news broadcast in English.",
    wholeClassGoal: "Present the broadcast and reflect on English use.",
    teamTask: "Perform the broadcast and complete a reflection worksheet.",
    status: "Active",
  },
];

export const staticLogs: StaticLog[] = [
  {
    id: 1, sessionId: 1, sectorId: "all", type: "World Update",
    entry: "World Council teams established remote communication with New Horizon Island.",
    addedBy: "Teacher", visibility: "Public", createdAt: new Date().toISOString(),
  },
  {
    id: 2, sessionId: 1, sectorId: "harbour", type: "Discovery",
    entry: "The Harbour Manager reported that the mystery boxes have strange symbols on them.",
    addedBy: "Teacher", visibility: "Public", createdAt: new Date().toISOString(),
  },
  {
    id: 3, sessionId: 1, sectorId: "garden", type: "Discovery",
    entry: "The Botanist found that the fast-growing plants glow slightly at night.",
    addedBy: "Teacher", visibility: "Public", createdAt: new Date().toISOString(),
  },
  {
    id: 4, sessionId: 1, sectorId: "tech", type: "Discovery",
    entry: "The Engineer decoded part of the Signal Tower message. It says 'HELP'.",
    addedBy: "Teacher", visibility: "Public", createdAt: new Date().toISOString(),
  },
  {
    id: 5, sessionId: 1, sectorId: "culture", type: "Discovery",
    entry: "The Archivist found an old map showing a fifth hidden sector underground.",
    addedBy: "Teacher", visibility: "Public", createdAt: new Date().toISOString(),
  },
];

export const staticTemplates: StaticTemplate[] = [
  { id: 1, templateId: "ASK01", category: "Asking", sentenceStarter: "Why did...", example: "Why did the Signal Tower send a message by itself?" },
  { id: 2, templateId: "ASK02", category: "Asking", sentenceStarter: "What happened when...", example: "What happened when the boxes arrived?" },
  { id: 3, templateId: "SUG01", category: "Suggesting", sentenceStarter: "We recommend...", example: "We recommend checking the supply labels." },
  { id: 4, templateId: "CHA01", category: "Challenging", sentenceStarter: "Are you sure...", example: "Are you sure the robot saw the correct time?" },
  { id: 5, templateId: "REP01", category: "Reporting", sentenceStarter: "We discovered...", example: "We discovered that the boxes came at night." },
  { id: 6, templateId: "DEC01", category: "Deciding", sentenceStarter: "Our team believes...", example: "Our team believes the tower is not broken." },
];

export const staticReports: StaticReport[] = [
  // No pre-made reports. Students start with a blank slate.
];
