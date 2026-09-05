import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { airfareQuerySchema, getAirfareIndex } from "./duffel";
import { AviationstackRequestError, fetchIndiaFlightStates } from "./aviationstack";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  airfare: router({
    index: publicProcedure.input(airfareQuerySchema).query(({ input }) => getAirfareIndex(input)),
  }),

  flights: router({
    india: publicProcedure.input(z.object({ flightIata: z.string().trim().min(2).max(10).optional() }).optional()).query(async ({ input }) => {
      try {
        return await fetchIndiaFlightStates(input?.flightIata);
      } catch (error) {
        if (error instanceof AviationstackRequestError && (error.status === 429 || /rate|limit|plan|quota/i.test(`${error.providerCode ?? ""} ${error.message}`))) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: error.message });
        }
        throw error;
      }
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
