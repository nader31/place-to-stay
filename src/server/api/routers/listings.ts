import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    name: user.username || `${user.firstName || ""} ${user.lastName || ""}`,
    profileImageURL: user.profileImageUrl,
  };
};

export const listingRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const listings = await ctx.prisma.listing.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
      },
    });
    const users = (
      await clerkClient.users.getUserList({
        userId: listings.map((listing) => listing.userId || ""),
        limit: 100,
      })
    ).map(filterUserForClient);

    return listings.map((listing) => ({
      listing,
      author: users.find((user) => user.id === listing.userId),
    }));
  }),

  create: privateProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1).max(1000),
        price: z.number().min(1).max(1000000),
        beds: z.number().min(1).max(100),
        baths: z.number().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const listing = await ctx.prisma.listing.create({
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          beds: input.beds,
          baths: input.baths,
          userId,
        },
      });
      return listing;
    }),
});
