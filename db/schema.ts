import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const worlds = sqliteTable("worlds", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  tagline: text("tagline").notNull(),
  currentSession: integer("current_session").notNull().default(1),
  teacherPasscode: text("teacher_passcode").notNull(),
  mode: text("mode").notNull().default("TEST"),
});

export const sectors = sqliteTable("sectors", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  worldId: integer("world_id").notNull(),
  sectorId: text("sector_id").notNull(),
  name: text("name").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  responsibility: text("responsibility"),
  locations: text("locations"),
  citizens: text("citizens"),
  currentProblem: text("current_problem"),
  mystery: text("mystery"),
  status: text("status").notNull().default("Active"),
});

export const teams = sqliteTable("teams", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  worldId: integer("world_id").notNull(),
  teamId: text("team_id").notNull(),
  name: text("name").notNull(),
  sectorId: text("sector_id").notNull(),
  members: text("members"),
  currentTask: text("current_task"),
  status: text("status").notNull().default("Active"),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  worldId: integer("world_id").notNull(),
  sessionId: integer("session_id").notNull(),
  title: text("title").notNull(),
  worldUpdate: text("world_update"),
  mainProblem: text("main_problem"),
  wholeClassGoal: text("whole_class_goal"),
  teamTask: text("team_task"),
  status: text("status").notNull().default("Active"),
});

export const logs = sqliteTable("logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  worldId: integer("world_id").notNull(),
  sessionId: integer("session_id").notNull(),
  sectorId: text("sector_id").notNull(),
  type: text("type").notNull(),
  entry: text("entry").notNull(),
  addedBy: text("added_by").notNull(),
  visibility: text("visibility").notNull().default("Public"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reports = sqliteTable("reports", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  worldId: integer("world_id").notNull(),
  sessionId: integer("session_id").notNull(),
  teamId: text("team_id").notNull(),
  sectorId: text("sector_id").notNull(),
  reportType: text("report_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("Submitted"),
  teacherComment: text("teacher_comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const events = sqliteTable("events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  worldId: integer("world_id").notNull(),
  sessionId: integer("session_id").notNull(),
  sectorId: text("sector_id").notNull(),
  eventTitle: text("event_title").notNull(),
  eventDetails: text("event_details"),
  active: text("active").notNull().default("true"),
});

export const templates = sqliteTable("templates", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  worldId: integer("world_id").notNull(),
  templateId: text("template_id").notNull(),
  category: text("category").notNull(),
  sentenceStarter: text("sentence_starter").notNull(),
  example: text("example"),
});
