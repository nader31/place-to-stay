import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
      where: {
        userId: "user_2Q0QrFWURrXTlashyDJhIg1ArpF",
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
});
