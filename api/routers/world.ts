import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { worlds } from "@db/schema";
import { eq } from "drizzle-orm";

export const worldRouter = createRouter({
  getByCode: publicQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(worlds).where(eq(worlds.code, input.code));
      return result[0] || null;
    }),

  create: publicQuery
    .input(z.object({
      name: z.string(),
      code: z.string(),
      tagline: z.string(),
      teacherPasscode: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(worlds).values({
        name: input.name,
        code: input.code,
        tagline: input.tagline,
        teacherPasscode: input.teacherPasscode,
        currentSession: 1,
        mode: "TEST",
      });
      return { success: true };
    }),

  verifyTeacher: publicQuery
    .input(z.object({
      code: z.string(),
      passcode: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(worlds).where(eq(worlds.code, input.code));
      const world = result[0];
      return { ok: world?.teacherPasscode === input.passcode };
    }),

  updateSession: publicQuery
    .input(z.object({
      code: z.string(),
      sessionId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(worlds).set({ currentSession: input.sessionId }).where(eq(worlds.code, input.code));
      return { success: true };
    }),
});
