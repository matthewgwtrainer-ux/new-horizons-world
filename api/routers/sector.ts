import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { sectors } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export const sectorRouter = createRouter({
  listByWorld: publicQuery
    .input(z.object({ worldId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(sectors).where(eq(sectors.worldId, input.worldId)).orderBy(asc(sectors.displayOrder));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(sectors).where(eq(sectors.id, input.id));
      return result[0] || null;
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      currentProblem: z.string().optional(),
      mystery: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(sectors).set(data).where(eq(sectors.id, id));
      return { success: true };
    }),
});
