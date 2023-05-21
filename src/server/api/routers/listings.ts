import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

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
        title: z
          .string()
          .min(1, { message: "Title is required" })
          .max(100, { message: "Title must be less than 100 characters long" }),
        description: z
          .string()
          .min(1, { message: "Description is required" })
          .max(1000, {
            message: "Description must be less than 1000 characters long",
          }),
        price: z
          .number()
          .min(1, { message: "Price must be greater than 0" })
          .max(1000000, { message: "Price must be less than $1,000,000" }),
        beds: z
          .number()
          .min(1, { message: "Beds must be greater than 0" })
          .max(100, { message: "Beds must be less than 100" }),
        baths: z
          .number()
          .min(1, { message: "Baths must be greater than 0" })
          .max(100, { message: "Baths must be less than 100" }),
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
