import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Badge, Card } from "../ui";
import usericon from "../assets/icons/userIcon.png";

const ELEMENT_KEY_BY_NAME = {
  Kim: "kim",
  Mộc: "moc",
  Thuỷ: "thuy",
  Hoả: "hoa",
  Thổ: "tho",
};

const ListingCard = ({ item, to }) => {
  const detailTo = `${to}/${item.listingId}`;
  const elementKey = ELEMENT_KEY_BY_NAME[item.elementName];
  const coverUrl = item.listingImages?.[0]?.image?.imageUrl;
  const ownerAvatar = item.accountName
    ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(item.accountName)}`
    : usericon;

  return (
    <Card interactive className="group relative flex h-full flex-col overflow-hidden">
      {item.tierName === "Tin Nổi Bật" && (
        <Badge className="absolute left-3 top-3 z-10 animate-seal-in">Nổi bật</Badge>
      )}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2">
        <img
          src={coverUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-water group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {elementKey && <Badge element={elementKey}>{item.elementName}</Badge>}
        <h3 className="truncate font-display text-lg leading-snug text-ink">
          <Link
            to={detailTo}
            className="transition-colors duration-fast ease-water hover:text-crimson"
          >
            {item.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center gap-2 border-t border-gold/20 pt-3">
          <img
            src={ownerAvatar}
            alt=""
            loading="lazy"
            className="h-7 w-7 shrink-0 rounded-full border border-gold/40 bg-paper-2 object-cover"
          />
          <span className="truncate text-sm text-muted">{item.accountName}</span>
        </div>
      </div>
    </Card>
  );
};

ListingCard.propTypes = {
  item: PropTypes.shape({
    listingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    title: PropTypes.string,
    elementName: PropTypes.string,
    tierName: PropTypes.string,
    accountName: PropTypes.string,
    listingImages: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.shape({ imageUrl: PropTypes.string }),
      })
    ),
  }).isRequired,
  to: PropTypes.string.isRequired,
};

export default ListingCard;
