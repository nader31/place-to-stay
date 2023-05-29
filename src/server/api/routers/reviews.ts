import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

type count = {
  rating: number;
  count: number;
};

export const reviewRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.prisma.review.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        listing: true,
      },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: reviews.map((review) => review.userId || ""),
        limit: 100,
      })
    ).map(filterUserForClient);

    return reviews.map((review) => ({
      review,
      author: users.find((user) => user.id === review.userId),
    }));
  }),

  getAllByListing: publicProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({
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

      const users = (
        await clerkClient.users.getUserList({
          userId: reviews.map((review) => review.userId || ""),
          limit: 100,
        })
      ).map(filterUserForClient);

      const totalReviews = await ctx.prisma.review.count({
        where: {
          listingId: input.listingId,
        },
      });

      const totalStars = await ctx.prisma.review.aggregate({
        where: {
          listingId: input.listingId,
        },
        _sum: {
          stars: true,
        },
      });

      const averageStars = (totalStars._sum.stars || 0) / totalReviews;

      const countForStars: count[] = [];

      for (let i = 1; i < 6; i++) {
        const count = await ctx.prisma.review.count({
          where: {
            listingId: input.listingId,
            stars: i,
          },
        });
        countForStars.push({
          rating: i,
          count: count,
        });
      }

      return {
        reviews: reviews.map((review) => ({
          ...review,
          author: users.find((user) => user.id === review.userId),
        })),
        totalReviews,
        averageStars,
        countForStars,
      };
    }),

  getAllByUserListings: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.prisma.listing.findMany({
        where: {
          userId: input.userId,
        },
      });

      const reviews = await ctx.prisma.review.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          listingId: {
            in: listings.map((listing) => listing.id),
          },
        },
        include: {
          listing: true,
        },
      });

      const totalReviews = await ctx.prisma.review.count({
        where: {
          listingId: {
            in: listings.map((listing) => listing.id),
          },
        },
      });

      const totalStars = await ctx.prisma.review.aggregate({
        where: {
          listingId: {
            in: listings.map((listing) => listing.id),
          },
        },
        _sum: {
          stars: true,
        },
      });

      const averageStars = (totalStars._sum.stars || 0) / totalReviews;

      const countForStars: count[] = [];

      for (let i = 1; i < 6; i++) {
        const count = await ctx.prisma.review.count({
          where: {
            listingId: {
              in: listings.map((listing) => listing.id),
            },
            stars: i,
          },
        });
        countForStars.push({
          rating: i,
          count: count,
        });
      }

      const users = (
        await clerkClient.users.getUserList({
          userId: reviews.map((review) => review.userId || ""),
          limit: 100,
        })
      ).map(filterUserForClient);

      return {
        reviews: reviews
          .filter((review) => review.text !== "")
          .slice(0, 3)
          .map((review) => ({
            ...review,
            author: users.find((user) => user.id === review.userId),
          })),
        totalReviews,
        averageStars,
        countForStars,
      };
    }),

  create: privateProcedure
    .input(
      z.object({
        listingId: z.string(),
        userId: z.string(),
        rating: z
          .number()
          .int()
          .min(1, { message: "Rating must be 1-5" })
          .max(5),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.create({
        data: {
          listingId: input.listingId,
          userId: input.userId,
          stars: input.rating,
          text: input.content,
        },
        include: {
          listing: true,
        },
      });

      return {
        review,
      };
    }),
});
