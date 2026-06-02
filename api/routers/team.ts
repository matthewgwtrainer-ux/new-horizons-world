import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { teams } from "@db/schema";
import { eq } from "drizzle-orm";

export const teamRouter = createRouter({
  listByWorld: publicQuery
    .input(z.object({ worldId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(teams).where(eq(teams.worldId, input.worldId));
    }),

  updateTask: publicQuery
    .input(z.object({
      id: z.number(),
      currentTask: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(teams).set({ currentTask: input.currentTask }).where(eq(teams.id, input.id));
      return { success: true };
    }),
});
