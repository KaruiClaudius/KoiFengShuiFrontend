import { Link } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext";
import ListingCard from "../../components/ListingCard";
import { Button, EmptyState } from "../../ui";

const Favorites = () => {
  const { favorites, clearFavorites } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-ink">Yêu thích</h1>
          <p className="text-muted mt-1">Những chú cá bạn đã lưu lại.</p>
        </div>
        {favorites.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm("Bỏ lưu tất cả cá Koi?")) clearFavorites();
            }}
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          title="Chưa có cá nào được lưu"
          description="Nhấn trái tim trên thẻ cá Koi để lưu lại những chú cá bạn thích."
          action={
            <Button as={Link} to="/KoiListings?category=1">
              Khám phá cá Koi
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map((fav) => (
            <ListingCard
              key={fav.listingId}
              item={{
                listingId: fav.listingId,
                title: fav.title,
                elementName: fav.elementName,
                accountName: fav.accountName,
                tierName: null,
                listingImages: fav.image
                  ? [{ image: { imageUrl: fav.image } }]
                  : [],
              }}
              to={`/Details/${fav.listingId}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
