import { createRouter, publicQuery } from "./middleware";
import { worldRouter } from "./routers/world";
import { sectorRouter } from "./routers/sector";
import { teamRouter } from "./routers/team";
import { sessionRouter } from "./routers/session";
import { logRouter } from "./routers/log";
import { reportRouter } from "./routers/report";
import { eventRouter } from "./routers/event";
import { templateRouter } from "./routers/template";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  world: worldRouter,
  sector: sectorRouter,
  team: teamRouter,
  session: sessionRouter,
  log: logRouter,
  report: reportRouter,
  event: eventRouter,
  template: templateRouter,
});

export type AppRouter = typeof appRouter;
