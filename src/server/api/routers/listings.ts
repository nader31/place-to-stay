import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const listingRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.listing.findMany();
  }),
});
