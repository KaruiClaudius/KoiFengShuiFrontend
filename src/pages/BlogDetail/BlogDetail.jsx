import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DOMPurify from "dompurify";
import { Link, useParams } from "react-router-dom";
import { getFeed, getPostById } from "../../api/community";
import { extractApiError } from "../../api/core";
import { POST_TYPES } from "../../constants/postTypes";
import { Button, Card, EmptyState, Skeleton } from "../../ui";
import { CloudDivider, KoiSilhouette } from "../../assets/motifs/Motifs";

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeHtml = (value) =>
  DOMPurify.sanitize(String(value ?? ""), { USE_PROFILES: { html: true } });

const postKeyOf = (post) => String(post.postId ?? post.id);

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getReadingMinutes = (html) => {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

function ArticleSkeleton() {
  return (
    <div
      role="status"
      aria-label="Đang tải"
      className="animate-fade-rise space-y-6"
    >
      <Skeleton className="h-4 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-11/12" />
        <Skeleton className="h-10 w-2/3" />
      </div>
      <Skeleton className="h-4 w-56" />
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-3 pt-2">
        {[0, 1, 2, 3, 4].map((row) => (
          <Skeleton
            key={row}
            className={`h-4 ${row === 4 ? "w-5/6" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}

function RelatedPostCard({ post }) {
  const imageUrl = post.imageUrls?.[0];

  return (
    <Card interactive className="h-full overflow-hidden">
      <Link
        to={`/blog/${post.postId ?? post.id}`}
        aria-label={`Đọc bài: ${post.name}`}
        className="group block h-full rounded-lg outline-none focus-visible:shadow-gold"
      >
        <div className="aspect-video overflow-hidden bg-paper-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-slow ease-water group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full items-center justify-center text-gold/60"
            >
              <KoiSilhouette size={48} flip />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink transition-colors duration-fast group-hover:text-crimson">
            {post.name}
          </h3>
        </div>
      </Link>
    </Card>
  );
}

RelatedPostCard.propTypes = {
  post: PropTypes.shape({
    postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      setPost(null);
      setRelatedPosts([]);
      try {
        const [found, feedResponse] = await Promise.all([
          getPostById(id),
          getFeed({ postTypeId: POST_TYPES.BLOG, page: 1, pageSize: 4 }),
        ]);
        if (cancelled) return;
        setPost(found);
        setRelatedPosts(
          (feedResponse.data?.data ?? feedResponse.data ?? [])
            .filter((candidate) => postKeyOf(candidate) !== String(id))
            .slice(0, 3)
        );
      } catch (err) {
        if (!cancelled) setError(extractApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.name} · Koi FengShui`;
  }, [post]);

  if (!loading && !error && !post) {
    return (
      <main className="grain-bg min-h-screen bg-paper text-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <EmptyState
            title="Bài viết không tồn tại hoặc đã bị ẩn"
            description="Hãy quay lại danh sách để đọc các bài viết khác nhé."
            action={
              <Button as={Link} to="/blog" variant="primary">
                Về trang Kinh nghiệm hay
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  const heroImage = post?.imageUrls?.[0];
  const additionalImages = post?.imageUrls?.slice(1) ?? [];
  const formattedDate = formatDate(post?.createAt);
  const readingMinutes = post ? getReadingMinutes(post.description) : 0;

  return (
    <main className="grain-bg min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {loading ? (
          <ArticleSkeleton />
        ) : error ? (
          <EmptyState
            title="Đã xảy ra lỗi khi tải bài viết"
            description="Vui lòng thử lại trong giây lát."
            action={
              <Button
                variant="primary"
                onClick={() => setReloadToken((token) => token + 1)}
              >
                Thử lại
              </Button>
            }
          />
        ) : (
          <article className="animate-fade-rise">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-crimson outline-none transition-colors duration-fast hover:text-crimson-deep focus-visible:shadow-gold"
            >
              <span aria-hidden="true">‹</span> Kinh nghiệm hay
            </Link>

            <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
              {post.name}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
              {formattedDate ? (
                <>
                  <span>{formattedDate}</span>
                  <span aria-hidden="true">·</span>
                </>
              ) : null}
              <span>{readingMinutes} phút đọc</span>
            </p>

            <div className="mt-8 overflow-hidden rounded-lg border border-gold/30 bg-paper-2 shadow-lift">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={post.name}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex aspect-video w-full items-center justify-center text-gold/60"
                >
                  <KoiSilhouette size={96} flip />
                </div>
              )}
            </div>

            <div
              className="mt-8 text-[15px] leading-relaxed text-ink-soft [&_a]:text-crimson [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_img]:my-4 [&_img]:rounded-md [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:text-ink [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 last:[&_p]:mb-0"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(post.description),
              }}
            />

            {additionalImages.length > 0 && (
              <div className="mt-8 space-y-4">
                {additionalImages.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`${post.name} — ảnh ${index + 2}`}
                    loading="lazy"
                    className="w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </article>
        )}
      </div>

      {!loading && !error && post && relatedPosts.length > 0 && (
        <section aria-labelledby="related-posts-heading" className="pb-16 md:pb-20">
          <CloudDivider className="mx-auto max-w-xs text-gold" />
          <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
            <h2
              id="related-posts-heading"
              className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              Bài viết liên quan
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((candidate) => (
                <RelatedPostCard
                  key={candidate.postId ?? `${candidate.id}-${candidate.name}`}
                  post={candidate}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
