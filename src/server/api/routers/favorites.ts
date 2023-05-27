import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
        listing: true,
      },
    });

    return favorites.map((favorite) => ({
      favorite,
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
      const favorite = await ctx.prisma.favorite.create({
        data: {
          userId: ctx.userId || "",
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
      const favorite = await ctx.prisma.favorite.delete({
        where: {
          userId_listingId: {
            listingId: input.listingId,
            userId: ctx.userId || "",
          },
        },
      });

      return {
        favorite,
      };
    }),
});
