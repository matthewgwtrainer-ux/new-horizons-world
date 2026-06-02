import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { reports } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const reportRouter = createRouter({
  listByWorld: publicQuery
    .input(z.object({ worldId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(reports).where(eq(reports.worldId, input.worldId)).orderBy(desc(reports.createdAt));
    }),

  submit: publicQuery
    .input(z.object({
      worldId: z.number(),
      sessionId: z.number(),
      teamId: z.string(),
      sectorId: z.string(),
      reportType: z.string(),
      title: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(reports).values({
        ...input,
        status: "Submitted",
      });
      return { success: true };
    }),

  addComment: publicQuery
    .input(z.object({
      id: z.number(),
      comment: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(reports).set({ teacherComment: input.comment }).where(eq(reports.id, input.id));
      return { success: true };
    }),
});
