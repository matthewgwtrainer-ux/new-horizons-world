import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
} from "drizzle-orm/mysql-core";

export const worlds = mysqlTable("worlds", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  tagline: varchar("tagline", { length: 255 }).notNull(),
  currentSession: int("current_session").notNull().default(1),
  teacherPasscode: varchar("teacher_passcode", { length: 100 }).notNull(),
  mode: varchar("mode", { length: 20 }).notNull().default("TEST"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sectors = mysqlTable("sectors", {
  id: serial("id").primaryKey(),
  worldId: bigint("world_id", { mode: "number", unsigned: true }).notNull(),
  sectorId: varchar("sector_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  displayOrder: int("display_order").notNull().default(0),
  responsibility: text("responsibility"),
  locations: text("locations"),
  citizens: text("citizens"),
  currentProblem: text("current_problem"),
  mystery: text("mystery"),
  status: varchar("status", { length: 20 }).notNull().default("Active"),
});

export const teams = mysqlTable("teams", {
  id: serial("id").primaryKey(),
  worldId: bigint("world_id", { mode: "number", unsigned: true }).notNull(),
  teamId: varchar("team_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  sectorId: varchar("sector_id", { length: 50 }).notNull(),
  members: text("members"),
  currentTask: text("current_task"),
  status: varchar("status", { length: 20 }).notNull().default("Active"),
});

export const sessions = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  worldId: bigint("world_id", { mode: "number", unsigned: true }).notNull(),
  sessionId: int("session_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  worldUpdate: text("world_update"),
  mainProblem: text("main_problem"),
  wholeClassGoal: text("whole_class_goal"),
  teamTask: text("team_task"),
  status: varchar("status", { length: 20 }).notNull().default("Active"),
});

export const logs = mysqlTable("logs", {
  id: serial("id").primaryKey(),
  worldId: bigint("world_id", { mode: "number", unsigned: true }).notNull(),
  sessionId: int("session_id").notNull(),
  sectorId: varchar("sector_id", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  entry: text("entry").notNull(),
  addedBy: varchar("added_by", { length: 100 }).notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("Public"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reports = mysqlTable("reports", {
  id: serial("id").primaryKey(),
  worldId: bigint("world_id", { mode: "number", unsigned: true }).notNull(),
  sessionId: int("session_id").notNull(),
  teamId: varchar("team_id", { length: 50 }).notNull(),
  sectorId: varchar("sector_id", { length: 50 }).notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Submitted"),
  teacherComment: text("teacher_comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = mysqlTable("events", {
  id: serial("id").primaryKey(),
  worldId: bigint("world_id", { mode: "number", unsigned: true }).notNull(),
  sessionId: int("session_id").notNull(),
  sectorId: varchar("sector_id", { length: 50 }).notNull(),
  eventTitle: varchar("event_title", { length: 255 }).notNull(),
  eventDetails: text("event_details"),
  active: varchar("active", { length: 10 }).notNull().default("true"),
});

export const templates = mysqlTable("templates", {
  id: serial("id").primaryKey(),
  worldId: bigint("world_id", { mode: "number", unsigned: true }).notNull(),
  templateId: varchar("template_id", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  sentenceStarter: text("sentence_starter").notNull(),
  example: text("example"),
});
