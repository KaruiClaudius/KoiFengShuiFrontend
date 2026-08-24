import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Skeleton } from "../../ui";
import { CloudDivider, KoiSilhouette } from "../../assets/motifs/Motifs";
import { PATHS } from "../../routes/paths";
import { useCommunityStore } from "../../stores/communityStore";
import { POST_STATUS_LABELS } from "../../constants/postTypes";

const stripHtml = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

export default function CommunityMyPostsPage() {
  const myPosts = useCommunityStore((state) => state.myPosts);
  const myPostsStatus = useCommunityStore((state) => state.myPostsStatus);
  const fetchMyPosts = useCommunityStore((state) => state.fetchMyPosts);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  return (
    <main className="grain-bg min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link to={PATHS.community} className="transition-colors duration-fast hover:text-crimson">
                Cộng đồng
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-medium text-ink-soft">
              Bài của tôi
            </li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="animate-fade-rise font-display text-3xl text-ink md:text-4xl">
            Bài của tôi
          </h1>
          <Button as={Link} to={PATHS.communitySubmit}>
            Viết bài mới
          </Button>
        </div>

        {myPostsStatus === "loading" ? (
          <div className="mt-8 space-y-4" role="status" aria-label="Đang tải">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="flex gap-4 overflow-hidden p-4">
                <Skeleton className="h-20 w-32 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : myPostsStatus === "error" ? (
          <EmptyState
            className="mt-8"
            title="Không thể tải bài viết"
            description="Vui lòng thử lại trong giây lát."
            action={<Button onClick={fetchMyPosts}>Thử lại</Button>}
          />
        ) : myPosts.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="Bạn chưa có bài viết nào"
            description="Chia sẻ chú cá Koi của bạn với cộng đồng nhé!"
            action={
              <Button as={Link} to={PATHS.communitySubmit}>
                Viết bài đầu tiên
              </Button>
            }
          />
        ) : (
          <ul className="mt-8 space-y-4">
            {myPosts.map((post) => {
              const statusLabel = POST_STATUS_LABELS[post.status] ?? post.status;
              const imageUrl = post.imageUrls?.[0];
              return (
                <li key={`${post.postId}-${post.updateAt ?? post.createAt}`}>
                  <Card interactive className="flex gap-4 overflow-hidden p-4">
                    <Link
                      to={`/community/${post.postId}`}
                      className="flex w-full gap-4 outline-none focus-visible:shadow-gold"
                    >
                      <div className="h-20 w-32 shrink-0 overflow-hidden rounded-md bg-paper-2">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={post.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-gold/60">
                            <KoiSilhouette size={32} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            element={post.status === "Approved" ? "jade" : "gold"}
                          >
                            {statusLabel}
                          </Badge>
                          <span className="text-xs text-muted">
                            {formatDate(post.updateAt ?? post.createAt)}
                          </span>
                        </div>
                        <h2 className="mt-1.5 truncate font-display text-base font-semibold text-ink">
                          {post.name}
                        </h2>
                        <p className="line-clamp-1 text-sm text-muted">
                          {stripHtml(post.description)}
                        </p>
                      </div>
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <CloudDivider className="mx-auto max-w-md text-gold/70" />
    </main>
  );
}
