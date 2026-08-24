import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, EmptyState, Skeleton } from "../../ui";
import { CloudDivider } from "../../assets/motifs/Motifs";
import { PATHS } from "../../routes/paths";
import { getPostById } from "../../api/community";
import { extractApiError } from "../../api/core";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

export default function CommunityDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPostById(id);
        if (!cancelled) setPost(data);
      } catch (err) {
        const apiError = extractApiError(err);
        if (!cancelled) setError(apiError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPost();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="grain-bg min-h-screen bg-paper text-ink">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link to={PATHS.community} className="transition-colors duration-fast hover:text-crimson">
                Cộng đồng
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-medium text-ink-soft">
              Bài viết
            </li>
          </ol>
        </nav>

        {loading ? (
          <div className="mt-8 space-y-4" role="status" aria-label="Đang tải">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ) : error ? (
          <EmptyState
            className="mt-8"
            title="Không thể tải bài viết"
            description={error}
            action={
              <Button as={Link} to={PATHS.community} variant="secondary">
                Về cộng đồng
              </Button>
            }
          />
        ) : (
          <>
            <h1 className="mt-4 animate-fade-rise font-display text-3xl leading-tight text-ink md:text-4xl">
              {post?.name}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {post?.accountName}
              {post?.createAt ? ` · ${formatDate(post.createAt)}` : ""}
            </p>
            {post?.imageUrls?.length > 0 && (
              <div className="mt-6 space-y-4">
                {post.imageUrls.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`${post.name} — ảnh ${index + 1}`}
                    loading="lazy"
                    className="w-full rounded-lg border border-gold/30 object-cover"
                  />
                ))}
              </div>
            )}
            <Card className="mt-6 p-6 md:p-8">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
                {post?.description}
              </p>
            </Card>
          </>
        )}
      </article>

      <CloudDivider className="mx-auto max-w-md text-gold/70" />
    </main>
  );
}
