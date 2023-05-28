import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const bookingRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.prisma.booking.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        listing: {
          include: {
            images: true,
          },
        },
      },
    });
    const users = (
      await clerkClient.users.getUserList({
        userId: bookings.map((booking) => booking.userId || ""),
        limit: 100,
      })
    ).map(filterUserForClient);

    return bookings.map((booking) => ({
      booking,
      user: users.find((user) => user.id === booking.userId),
    }));
  }),

  getByUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum(["pending", "confirmed", "canceled"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.prisma.booking.findMany({
        take: 100,
        orderBy: {
          startDate: "asc",
        },
        where: {
          userId: input.userId,
          status: input.status,
        },
        include: {
          listing: {
            include: {
              images: true,
            },
          },
        },
      });
      const users = (
        await clerkClient.users.getUserList({
          userId: bookings.map((booking) => booking.userId || ""),
          limit: 100,
        })
      ).map(filterUserForClient);

      return bookings.map((booking) => ({
        booking,
        user: users.find((user) => user.id === booking.userId),
        nights: Math.ceil(
          (booking.endDate.getTime() - booking.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }));
    }),

  getByListing: publicProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.prisma.booking.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          listingId: input.listingId,
        },
        include: {
          listing: {
            include: {
              images: true,
            },
          },
        },
      });
      const users = (
        await clerkClient.users.getUserList({
          userId: bookings.map((booking) => booking.userId || ""),
          limit: 100,
        })
      ).map(filterUserForClient);

      return bookings.map((booking) => ({
        booking,
        user: users.find((user) => user.id === booking.userId),
      }));
    }),

  getBookingDatesByListing: publicProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.prisma.booking.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          listingId: input.listingId,
          status: "confirmed",
        },
        include: {
          listing: true,
        },
      });
      return bookings.map((booking) => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
      }));
    }),

  getByUserAndListing: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        listingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.prisma.booking.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          userId: input.userId,
          listingId: input.listingId,
        },
        include: {
          listing: {
            include: {
              images: true,
            },
          },
        },
      });
      const users = (
        await clerkClient.users.getUserList({
          userId: bookings.map((booking) => booking.userId || ""),
          limit: 100,
        })
      ).map(filterUserForClient);

      if (bookings.length === 0 || input.userId === undefined) {
        return null;
      } else {
        return bookings.map((booking) => ({
          booking,
          user: users.find((user) => user.id === booking.userId),
          nights: Math.ceil(
            (booking.endDate.getTime() - booking.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        }))[0];
      }
    }),

  getByListingAuthor: publicProcedure
    .input(
      z.object({
        listingAuthorId: z.string(),
        status: z.enum(["pending", "confirmed", "canceled"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.prisma.booking.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          listing: {
            userId: input.listingAuthorId,
          },
          status: input.status,
        },
        include: {
          listing: {
            include: {
              images: true,
            },
          },
        },
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: bookings.map((booking) => booking.userId || ""),
          limit: 100,
        })
      ).map(filterUserForClient);

      return bookings.map((booking) => ({
        ...booking,
        nights: Math.ceil(
          (booking.endDate.getTime() - booking.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        user: users.find((user) => user.id === booking.userId),
      }));
    }),

  getBookingCountByUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.prisma.booking.count({
        where: {
          userId: input.userId,
        },
      });
      return count;
    }),

  create: privateProcedure
    .input(
      z.object({
        listingId: z.string(),
        userId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const booking = await ctx.prisma.booking.create({
        data: {
          listingId: input.listingId,
          userId,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });
      return booking;
    }),

  deleteByUserAndListing: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        listingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      if (userId !== input.userId) {
        throw new Error("Unauthorized");
      }
      const booking = await ctx.prisma.booking.deleteMany({
        where: {
          userId: input.userId,
          listingId: input.listingId,
        },
      });
      return booking;
    }),

  updateBookingStatus: privateProcedure
    .input(
      z.object({
        bookingId: z.string(),
        status: z.enum(["confirmed", "canceled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.update({
        where: {
          id: input.bookingId,
        },
        data: {
          status: input.status,
        },
      });
      return booking;
    }),
});
