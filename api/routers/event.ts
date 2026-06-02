import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { events } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const eventRouter = createRouter({
  listByWorld: publicQuery
    .input(z.object({ worldId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(events).where(eq(events.worldId, input.worldId));
    }),

  listActive: publicQuery
    .input(z.object({ worldId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(events).where(
        and(eq(events.worldId, input.worldId), eq(events.active, "true"))
      );
    }),
});
