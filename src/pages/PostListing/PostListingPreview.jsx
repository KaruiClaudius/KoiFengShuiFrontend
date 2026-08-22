import { useState } from "react";
import PropTypes from "prop-types";
import DOMPurify from "dompurify";
import { Badge, Card } from "../../ui";
import { CloudDivider, KoiSilhouette } from "../../assets/motifs/Motifs";
import usericon from "../../assets/icons/userIcon.png";

const ELEMENT_KEY_BY_NAME = {
  Kim: "kim",
  Mộc: "moc",
  Thuỷ: "thuy",
  Hoả: "hoa",
  Thổ: "tho",
};

const InfoRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-gold/25 py-3">
    <dt className="shrink-0 text-muted">{label}</dt>
    <dd className="text-right font-medium text-ink">{children}</dd>
  </div>
);

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const ImageGallery = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = Array.isArray(images)
    ? images.filter((image) => image?.image?.imageUrl)
    : [];

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-gold/40 bg-paper-2">
        <KoiSilhouette size={96} className="text-gold" />
      </div>
    );
  }

  const index = Math.min(activeIndex, safeImages.length - 1);

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-gold/40 bg-paper-2 shadow-plaque">
        <img
          src={safeImages[index].image.imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((image, idx) => (
            <button
              key={`${image.image.imageUrl}-${idx}`}
              type="button"
              aria-label={`Xem hình ${idx + 1}`}
              aria-pressed={idx === index}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-sm transition-all duration-fast ease-water ${
                idx === index
                  ? "ring-2 ring-gold ring-offset-2 ring-offset-paper"
                  : "opacity-70 ring-1 ring-gold/30 hover:opacity-100 hover:ring-gold/60"
              }`}
            >
              <img
                src={image.image.imageUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

ImageGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.shape({ imageUrl: PropTypes.string }),
    })
  ),
  title: PropTypes.string,
};

const PropertyPreview = ({ propertyDetails }) => {
  const hasElement = Boolean(
    propertyDetails.elementName &&
      propertyDetails.elementName !== "Non element"
  );
  const ownerAvatar = propertyDetails.ownerName
    ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
        propertyDetails.ownerName
      )}`
    : usericon;

  return (
    <article>
      <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl">
        {hasElement && `[${propertyDetails.elementName}] `}
        {propertyDetails.name}
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ImageGallery
            images={propertyDetails.homeImages}
            title={propertyDetails.name}
          />
        </div>

        <Card className="h-fit p-6 lg:col-span-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src={ownerAvatar}
              alt={propertyDetails.ownerName || ""}
              className="h-16 w-16 rounded-full border-2 border-gold/50 bg-paper-2 object-cover"
            />
            <h2 className="font-display text-xl text-ink">
              {propertyDetails.ownerName}
            </h2>
          </div>

          <dl className="mt-6 text-sm">
            <InfoRow label="Số lượng">{propertyDetails.quantity}</InfoRow>
            <InfoRow label="Màu sắc">
              {(propertyDetails.colors || []).join(", ")}
            </InfoRow>
            {hasElement && (
              <InfoRow label="Bản mệnh">
                <Badge element={ELEMENT_KEY_BY_NAME[propertyDetails.elementName]}>
                  {propertyDetails.elementName}
                </Badge>
              </InfoRow>
            )}
          </dl>
        </Card>
      </div>

      <CloudDivider className="mx-auto mt-10 max-w-xs text-gold" />

      <Card className="mt-8 p-6">
        <h2 className="font-display text-2xl text-ink">Mô tả</h2>
        <div
          className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-soft [&_a]:font-medium [&_a]:text-crimson [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_img]:my-3 [&_img]:rounded-md [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(propertyDetails.description || ""),
          }}
        />
      </Card>
    </article>
  );
};

PropertyPreview.propTypes = {
  propertyDetails: PropTypes.shape({
    name: PropTypes.string,
    listingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ownerName: PropTypes.string,
    homeImages: PropTypes.arrayOf(
      PropTypes.shape({
        image: PropTypes.shape({ imageUrl: PropTypes.string }),
      })
    ),
    colors: PropTypes.arrayOf(PropTypes.string),
    elementName: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func,
};

export default PropertyPreview;
