import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { sessions } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const sessionRouter = createRouter({
  listByWorld: publicQuery
    .input(z.object({ worldId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(sessions).where(eq(sessions.worldId, input.worldId));
    }),

  getCurrent: publicQuery
    .input(z.object({ worldId: z.number(), sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(sessions).where(
        and(eq(sessions.worldId, input.worldId), eq(sessions.sessionId, input.sessionId))
      ).limit(1);
      return result[0] || null;
    }),
});
