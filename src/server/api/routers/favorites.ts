import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const favoriteRouter = createTRPCRouter({
  getAllByUser: publicProcedure.query(async ({ ctx }) => {
    const favorites = await ctx.prisma.favorite.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId: ctx.userId || "",
      },
      include: {
        listing: {
          include: {
            images: true,
            bookings: true,
            review: true,
            favorite: true,
          },
        },
      },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: favorites.map((favorite) => favorite.listing.userId || ""),
        limit: 100,
      })
    ).map(filterUserForClient);

    return favorites.map((favorite) => ({
      listing: favorite.listing,
      author: users.find((user) => user.id === favorite.listing.userId),
      stars:
        favorite.listing.review.length === 0
          ? undefined
          : favorite.listing.review.reduce(
              (acc, review) => acc + review.stars,
              0
            ) / favorite.listing.review.length,
      favorites: favorite.listing.favorite.length,
      favorite: true,
      bookingStatus: favorite.listing.bookings.find(
        (booking) => booking.userId === ctx.userId
      )?.status,
    }));
  }),

  getCountByListing: publicProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const favorites = await ctx.prisma.favorite.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          listingId: input.listingId,
        },
        include: {
          listing: true,
        },
      });

      return favorites.map((favorite) => ({
        favorite,
      }));
    }),

  create: publicProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new Error("You must be logged in to favorite a listing");
      }
      const favorite = await ctx.prisma.favorite.create({
        data: {
          userId: ctx.userId,
          listingId: input.listingId,
        },
      });

      return {
        favorite,
      };
    }),

  delete: publicProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new Error("You must be logged in to favorite a listing");
      }
      const favorite = await ctx.prisma.favorite.delete({
        where: {
          userId_listingId: {
            listingId: input.listingId,
            userId: ctx.userId,
          },
        },
      });

      return {
        favorite,
      };
    }),

  deleteAllWhereUserIdIsNull: publicProcedure.mutation(async ({ ctx }) => {
    const favorites = await ctx.prisma.favorite.deleteMany({
      where: {
        userId: "",
      },
    });

    return {
      favorites,
    };
  }),
});
