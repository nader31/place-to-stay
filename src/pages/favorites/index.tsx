import PageLayout from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";
import { ListingView } from "..";

const FavoritesView = () => {
  const { data, isLoading } = api.favorites.getAllByUser.useQuery();

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {data?.map((listing) => (
        <ListingView {...listing} key={listing.listing.id} />
      ))}
    </div>
  );
};

export default function Favorites() {
  return (
    <PageLayout>
      <h3 className="mb-5 font-medium">Favorites</h3>
      <FavoritesView />
    </PageLayout>
  );
}
