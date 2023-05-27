import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const categoryEnum = z.enum([
  "apartment",
  "house",
  "hotel",
  "guesthouse",
  "hostel",
  "bnb",
  "other",
]);
export type Category = z.infer<typeof categoryEnum>;

export const listingRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const listings = await ctx.prisma.listing.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
        bookings: true,
        review: true,
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
      stars:
        listing.review.length === 0
          ? undefined
          : listing.review.reduce((acc, review) => acc + review.stars, 0) /
            listing.review.length,
    }));
  }),

  getAllByAvailableDates: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number(),
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        search: z.string().optional(),
        category: categoryEnum.optional(),
        beds: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.prisma.booking.findMany({
        where: {
          OR: [
            {
              startDate: {
                lte: input.startDate,
              },
              endDate: {
                gte: input.startDate,
              },
            },
            {
              startDate: {
                lte: input.endDate,
              },
              endDate: {
                gte: input.endDate,
              },
            },
          ],
        },
      });

      const listingIds =
        !input.startDate || !input.endDate
          ? []
          : bookings.map((booking) => booking.listingId);

      const listings = await ctx.prisma.listing.findMany({
        take: input.limit + 1,
        skip: input.skip,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          favorite: {
            _count: "desc",
          },
        },
        where: {
          userId: {
            not: ctx.userId,
          },
          id: {
            notIn: listingIds,
          },
          OR: [
            { city: { contains: input.search } },
            { country: { contains: input.search } },
            { title: { contains: input.search } },
          ],
          category: input.category,
          beds: input.beds === 5 ? { gte: input.beds } : input.beds,
        },
        include: {
          images: true,
          bookings: true,
          review: true,
          favorite: true,
          _count: {
            select: {
              favorite: true,
            },
          },
        },
      });

      const listingsCount = await ctx.prisma.listing.count({
        where: {
          userId: {
            not: ctx.userId,
          },
          id: {
            notIn: listingIds,
          },
          OR: [
            { city: { contains: input.search } },
            { country: { contains: input.search } },
            { title: { contains: input.search } },
          ],
          category: input.category,
          beds: input.beds === 5 ? { gte: input.beds } : input.beds,
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (listings.length > input.limit) {
        const nextListing = listings.pop();
        nextCursor = nextListing?.id;
      }

      const users = (
        await clerkClient.users.getUserList({
          userId: listings.map((listing) => listing.userId || ""),
          limit: 100,
        })
      ).map(filterUserForClient);

      return {
        listings: listings.map((listing) => ({
          listing,
          author: users.find((user) => user.id === listing.userId),
          stars:
            listing.review.length === 0
              ? undefined
              : listing.review.reduce((acc, review) => acc + review.stars, 0) /
                listing.review.length,
          favorite: !!listing.favorite.find(
            (favorite) => favorite.userId === ctx.userId
          ),
          favorites: listing._count.favorite,
          bookingStatus: listing.bookings.find(
            (booking) => booking.userId === ctx.userId
          )?.status,
        })),
        nextCursor,
        listingsCount,
      };
    }),

  getAllByUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.prisma.listing.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          userId: input.userId,
        },
        include: {
          images: true,
          bookings: true,
          review: true,
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
        stars:
          listing.review.length === 0
            ? undefined
            : listing.review.reduce((acc, review) => acc + review.stars, 0) /
              listing.review.length,
      }));
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.findUnique({
        where: {
          id: input.id,
        },
        include: {
          images: true,
          bookings: true,
        },
      });
      const user = filterUserForClient(
        await clerkClient.users.getUser(listing?.userId || "")
      );

      return { listing, author: user };
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
        category: categoryEnum,
        price: z
          .number()
          .min(1, { message: "Price must be greater than 0" })
          .max(1000000, { message: "Price must be less than 1.000.000€" }),
        beds: z
          .number()
          .min(1, { message: "Beds must be greater than 0" })
          .max(100, { message: "Beds must be less than 100" }),
        baths: z
          .number()
          .min(1, { message: "Baths must be greater than 0" })
          .max(100, { message: "Baths must be less than 100" }),
        country: z.string().min(1, { message: "Country is required" }),
        city: z.string().min(1, { message: "City is required" }),
        images: z
          .array(
            z.object({
              url: z.string(),
            })
          )
          .optional(),
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
          country: input.country,
          city: input.city,
          userId,
          category: input.category,
          images: {
            create: input.images,
          },
        },
      });
      return listing;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
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
        category: categoryEnum,
        price: z
          .number()
          .min(1, { message: "Price must be greater than 0" })
          .max(1000000, { message: "Price must be less than 1.000.000€" }),
        beds: z
          .number()
          .min(1, { message: "Beds must be greater than 0" })
          .max(100, { message: "Beds must be less than 100" }),
        baths: z
          .number()
          .min(1, { message: "Baths must be greater than 0" })
          .max(100, { message: "Baths must be less than 100" }),
        city: z.string().min(1, { message: "City is required" }),
        images: z
          .array(
            z.object({
              url: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          beds: input.beds,
          baths: input.baths,
          city: input.city,
          category: input.category,
          images: {
            deleteMany: {},
            create: input.images,
          },
        },
      });
      return listing;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (!userId) {
        throw new Error("Not authorized");
      }

      const listing = await ctx.prisma.listing.findUnique({
        where: {
          id: input.id,
        },
        include: {
          images: true,
        },
      });

      if (!listing) {
        throw new Error("Listing not found");
      }

      await ctx.prisma.image.deleteMany({
        where: {
          listingId: input.id,
        },
      });

      await ctx.prisma.listing.delete({
        where: {
          id: input.id,
        },
      });

      return listing;
    }),
});
