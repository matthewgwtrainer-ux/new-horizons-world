import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { logs } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const logRouter = createRouter({
  listByWorld: publicQuery
    .input(z.object({ worldId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(logs).where(eq(logs.worldId, input.worldId)).orderBy(desc(logs.createdAt));
    }),

  add: publicQuery
    .input(z.object({
      worldId: z.number(),
      sessionId: z.number(),
      sectorId: z.string(),
      type: z.string(),
      entry: z.string(),
      addedBy: z.string(),
      visibility: z.string().default("Public"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(logs).values(input);
      return { success: true };
    }),
});
