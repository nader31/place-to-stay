import { createTRPCRouter } from "~/server/api/trpc";
import { listingRouter } from "./routers/listings";
import { profileRouter } from "./routers/profile";
import { bookingRouter } from "./routers/bookings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  listings: listingRouter,
  profile: profileRouter,
  booking: bookingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
