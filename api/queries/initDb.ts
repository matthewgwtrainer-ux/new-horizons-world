import Database from "better-sqlite3";
import { env } from "../lib/env";
import fs from "fs";
import path from "path";

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS worlds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  current_session INTEGER NOT NULL DEFAULT 1,
  teacher_passcode TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'TEST'
);

CREATE TABLE IF NOT EXISTS sectors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  sector_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  responsibility TEXT,
  locations TEXT,
  citizens TEXT,
  current_problem TEXT,
  mystery TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sector_id TEXT NOT NULL,
  members TEXT,
  current_task TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  world_update TEXT,
  main_problem TEXT,
  whole_class_goal TEXT,
  team_task TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  sector_id TEXT NOT NULL,
  type TEXT NOT NULL,
  entry TEXT NOT NULL,
  added_by TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'Public',
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  team_id TEXT NOT NULL,
  sector_id TEXT NOT NULL,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Submitted',
  teacher_comment TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  sector_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_details TEXT,
  active TEXT NOT NULL DEFAULT 'true'
);

CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  template_id TEXT NOT NULL,
  category TEXT NOT NULL,
  sentence_starter TEXT NOT NULL,
  example TEXT
);
`;

const SEED_SQL = `
-- Clear existing data (safe idempotent re-seed)
DELETE FROM templates;
DELETE FROM events;
DELETE FROM logs;
DELETE FROM reports;
DELETE FROM sessions;
DELETE FROM teams;
DELETE FROM sectors;
DELETE FROM worlds;

-- Insert world
INSERT INTO worlds (name, code, tagline, current_session, teacher_passcode, mode)
VALUES ('New Horizon Island', 'NHI2026', 'Can our English make an AI world come alive?', 1, 'worldcouncil', 'TEST');

-- Insert sectors
INSERT INTO sectors (world_id, sector_id, name, display_order, responsibility, locations, citizens, current_problem, mystery, status) VALUES
(1, 'harbour', 'Harbour Sector', 1, 'Transport, supplies, visitors, trade', 'Main Dock; Ferry Gate; Supply Warehouse', 'Harbour Manager; Ferry Pilot; Supply Robot', 'Supply boxes arrived with no sender.', 'Who sent the boxes and why?', 'Active'),
(1, 'garden', 'Garden Sector', 2, 'Food, water, plants, animals, health', 'Greenhouse; Water Tank; Animal Shelter', 'Botanist; Water Keeper; Animal Helper', 'Plants are growing too fast.', 'What is causing the strange growth?', 'Active'),
(1, 'tech', 'Tech Sector', 3, 'Power, robots, communication, repairs', 'Signal Tower; Robot Garage; Power Station', 'Engineer; Repair Robot; Signal Officer', 'Signal Tower sends messages by itself.', 'Who or what is using the tower?', 'Active'),
(1, 'culture', 'Culture Sector', 4, 'History, citizens, news, rules', 'Council Hall; Archive Room; Newsroom', 'Archivist; Young Reporter; Council Guide', 'Nobody knows who built the island.', 'Who built New Horizon Island?', 'Active');

-- Insert teams
INSERT INTO teams (world_id, team_id, name, sector_id, members, current_task, status) VALUES
(1, 'T1', 'Harbour Team', 'harbour', '', 'Investigate the mystery boxes.', 'Active'),
(1, 'T2', 'Garden Team', 'garden', '', 'Investigate the fast-growing plants.', 'Active'),
(1, 'T3', 'Tech Team', 'tech', '', 'Investigate the strange signal tower.', 'Active'),
(1, 'T4', 'Culture Team', 'culture', '', 'Investigate the island''s lost history.', 'Active');

-- Insert sessions
INSERT INTO sessions (world_id, session_id, title, world_update, main_problem, whole_class_goal, team_task, status) VALUES
(1, 1, 'First Contact with New Horizon Island', 'The World Council has invited your teams to investigate a new AI island near Hong Kong remotely. Four sectors are working, but strange problems have already appeared.', 'Each sector has a mystery. The island cannot open to visitors until the teams investigate and report clearly.', 'Use English to question AI citizens, collect evidence, and make a first World Council report.', 'Click your sector, read the problem, choose a citizen in Meet the Citizens, ask them questions in English, then write a short report.', 'Active'),
(1, 2, 'Meet the Citizens', 'The AI citizens are becoming more talkative. Some have started leaving messages for the World Council teams.', 'Citizens know more than they are saying. Teams must ask the right questions.', 'Interview AI citizens and collect character profiles.', 'Choose a citizen in Meet the Citizens. Message them in English, ask questions, and record what you learn.', 'Active'),
(1, 3, 'First Sector Problems', 'The mysteries are deepening. New clues have appeared in each sector.', 'Problems are connected across sectors. Teams must share information.', 'Investigate local issues and propose solutions.', 'Write a problem report with evidence and a recommended solution.', 'Active'),
(1, 4, 'World Council Meeting', 'The World Council has called an emergency meeting. Teams must present their findings.', 'Evidence from all sectors points to a bigger mystery.', 'Present evidence, negotiate, and make joint decisions.', 'Prepare a council presentation. Explain your evidence and recommend action.', 'Active'),
(1, 5, 'Island Development', 'With mysteries partially solved, teams can now propose improvements to their sectors.', 'What improvements does each sector need?', 'Propose improvements with reasons and predicted consequences.', 'Write an improvement proposal. Explain why it helps and what might happen.', 'Active'),
(1, 6, 'Newsroom Day', 'The island''s first newspaper is being launched. Teams become journalists.', 'Turn world events into clear news reports and headlines.', 'Write news articles and blog posts about island events.', 'Write a news article with a headline, lead paragraph, and body.', 'Active'),
(1, 7, 'Broadcast Preparation', 'The island is ready for its first live news broadcast.', 'Teams must write and rehearse a Day C-style news script.', 'Prepare broadcast scripts and assign roles.', 'Write a broadcast script with anchor, reporter, and interview segments.', 'Active'),
(1, 8, 'Final Broadcast and Reflection', 'It''s broadcast day! Teams present their final news show.', 'Deliver a polished news broadcast in English.', 'Present the broadcast and reflect on English use.', 'Perform the broadcast and complete a reflection worksheet.', 'Active');

-- Insert logs
INSERT INTO logs (world_id, session_id, sector_id, type, entry, added_by, visibility) VALUES
(1, 1, 'all', 'World Update', 'World Council teams established remote communication with New Horizon Island and began their investigation from the Hong Kong mainland.', 'Teacher', 'Public'),
(1, 1, 'harbour', 'Discovery', 'The Harbour Manager reported that the mystery boxes have strange symbols on them.', 'Teacher', 'Public'),
(1, 1, 'garden', 'Discovery', 'The Botanist found that the fast-growing plants glow slightly at night.', 'Teacher', 'Public'),
(1, 1, 'tech', 'Discovery', 'The Engineer decoded part of the Signal Tower message. It says ''HELP''.', 'Teacher', 'Public'),
(1, 1, 'culture', 'Discovery', 'The Archivist found an old map showing a fifth hidden sector underground.', 'Teacher', 'Public');

-- Insert events
INSERT INTO events (world_id, session_id, sector_id, event_title, event_details, active) VALUES
(1, 1, 'all', 'First Council Meeting', 'The World Council asks all teams to investigate their sector and report back.', 'true');

-- Insert templates
INSERT INTO templates (world_id, template_id, category, sentence_starter, example) VALUES
(1, 'ASK01', 'Asking', 'Why did...', 'Why did the Signal Tower send a message by itself?'),
(1, 'ASK02', 'Asking', 'What happened when...', 'What happened when the boxes arrived?'),
(1, 'SUG01', 'Suggesting', 'We recommend...', 'We recommend checking the supply labels.'),
(1, 'CHA01', 'Challenging', 'Are you sure...', 'Are you sure the robot saw the correct time?'),
(1, 'REP01', 'Reporting', 'We discovered...', 'We discovered that the boxes came at night.'),
(1, 'DEC01', 'Deciding', 'Our team believes...', 'Our team believes the tower is not broken.');
`;

export async function initDatabase() {
  const dbPath = env.databasePath;

  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Open database directly with better-sqlite3
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Create all tables
  db.exec(CREATE_TABLES_SQL);
  console.log("Database tables created/verified");

  // Check if world exists — if not, seed
  const worldCount = db.prepare("SELECT COUNT(*) as count FROM worlds").get() as { count: number };
  if (worldCount.count === 0) {
    db.exec(SEED_SQL);
    console.log("Database seeded with New Horizons World data");
  } else {
    console.log("Database already seeded, skipping");
  }

  db.close();
}
