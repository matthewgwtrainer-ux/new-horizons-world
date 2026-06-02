import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { templates } from "@db/schema";
import { eq } from "drizzle-orm";

export const templateRouter = createRouter({
  listByWorld: publicQuery
    .input(z.object({ worldId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(templates).where(eq(templates.worldId, input.worldId));
    }),
});
