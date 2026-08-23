import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { getFengShuiKoiFishPost } from "../../config/axios";
import { Button, Card, EmptyState, notify, Skeleton } from "../../ui";
import { default as ListingCard } from "../../components/ListingCard";

const COLOR_OPTIONS = [
  { value: "White", label: "Trắng" },
  { value: "Red", label: "Đỏ" },
  { value: "Black", label: "Đen" },
  { value: "Yellow", label: "Vàng" },
  { value: "Silver", label: "Xám bạc" },
];

const PAGE_WINDOW_SIZE = 5;
const SKELETON_COUNT = 6;

const getPageWindow = (currentPage, totalPages) => {
  const start = Math.min(
    Math.max(1, currentPage - Math.floor(PAGE_WINDOW_SIZE / 2)),
    Math.max(1, totalPages - PAGE_WINDOW_SIZE + 1)
  );
  const end = Math.min(totalPages, start + PAGE_WINDOW_SIZE - 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const KoiListingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [elementData, setElement] = useState([]);
  const [categoryData, setCategory] = useState([]);
  const [cardDataKoi, setCardDataKoi] = useState([]);

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedElement, setSelectedElement] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    const loadMeta = async () => {
      try {
        const responseMarketCategory = await api
          .get("/api/MarketCategory/GetAll")
          .then((response) => response.data);
        const responseElement = await api
          .get("/api/Element/GetAll")
          .then((response) => response.data);
        if (cancelled) return;
        setCategory(responseMarketCategory.data);
        setElement(responseElement.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const elementFromUrl = searchParams.get("element");
    const qFromUrl = searchParams.get("q");
    setSearchTerm(qFromUrl ?? "");
    if (!categoryFromUrl && !elementFromUrl) {
      if (qFromUrl) {
        setSelectedCategory(1);
        setCurrentPage(1);
      }
      return;
    }
    setSelectedCategory(Number(categoryFromUrl || 1));
    if (elementFromUrl) {
      setSelectedElement([Number(elementFromUrl)]);
    }
    setCurrentPage(1);
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    if (!selectedCategory) return;
    try {
      setLoading(true);
      setError(null);
      const responseKoi = await getFengShuiKoiFishPost(
        selectedCategory,
        currentPage,
        pageSize
      );
      setCardDataKoi(
        Array.isArray(responseKoi?.data) ? responseKoi.data : []
      );
      setTotal(responseKoi?.totalItems ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentPage, pageSize]);

  useEffect(() => {
    if (!selectedCategory) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [fetchData, selectedCategory]);

  const filterKoiByElement = (data) => {
    if (selectedElement.length === 0) return data;
    return data.filter((item) => selectedElement.includes(item.elementId));
  };

  const filterKoiByColor = (data) => {
    if (selectedColors.length === 0) return data;
    return data.filter((item) => {
      if (item.color && typeof item.color === "string") {
        return selectedColors.some((color) =>
          item.color.toLowerCase().includes(color.toLowerCase())
        );
      }
      return false;
    });
  };

  const filterKoiBySearch = (data) => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) return data;
    return data.filter((item) =>
      String(item.title ?? "")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  };

  const filteredKoi = filterKoiByElement(
    filterKoiByColor(filterKoiBySearch(cardDataKoi))
  );

  const hasActiveSearch = Boolean(searchTerm.trim());

  const toggleColor = (value) => {
    setSelectedColors((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const toggleElement = (elementId) => {
    const nextElements = selectedElement.includes(elementId)
      ? selectedElement.filter((id) => id !== elementId)
      : [...selectedElement, elementId];
    setSelectedElement(nextElements);
  };

  const updateQueryParam = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set("q", value);
    } else {
      nextParams.delete("q");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    updateQueryParam(event.target.value);
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedElement([]);
    setSearchTerm("");
    updateQueryParam("");
    notify.success("Đã xóa tất cả bộ lọc");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageWindow = getPageWindow(currentPage, totalPages);

  const currentCategoryName = categoryData.find(
    (category) => category.categoryid === selectedCategory
  )?.categoryName;

  const filterPanel = (
    <div className="flex flex-col gap-6">
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label
          htmlFor="koi-search-input"
          className="font-display text-base font-semibold text-ink"
        >
          Tìm kiếm
        </label>
        <input
          id="koi-search-input"
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Tìm chú cá Koi của bạn…"
          autoComplete="off"
          className="mt-3 w-full rounded-full border border-gold/40 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-shadow duration-fast ease-water placeholder:text-muted focus:shadow-gold"
        />
      </form>

      <fieldset className="m-0 border-0 p-0">
        <legend className="font-display text-base font-semibold text-ink">
          Bản mệnh
        </legend>
        <div className="mt-3 space-y-2.5">
          {elementData.map((element) => (
            <label
              key={element.elementId}
              htmlFor={`koi-element-${element.elementId}`}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft transition-colors duration-fast ease-water hover:text-ink"
            >
              <input
                id={`koi-element-${element.elementId}`}
                type="checkbox"
                className="h-4 w-4 accent-crimson"
                checked={selectedElement.includes(element.elementId)}
                onChange={() => toggleElement(element.elementId)}
              />
              {element.elementName}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="font-display text-base font-semibold text-ink">
          Màu sắc
        </legend>
        <div className="mt-3 space-y-2.5">
          {COLOR_OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`koi-color-${option.value}`}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft transition-colors duration-fast ease-water hover:text-ink"
            >
              <input
                id={`koi-color-${option.value}`}
                type="checkbox"
                className="h-4 w-4 accent-crimson"
                checked={selectedColors.includes(option.value)}
                onChange={() => toggleColor(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={clearFilters}
      >
        Xóa bộ lọc
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen grain-bg bg-paper pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted"
        >
          <Link
            to="/"
            className="transition-colors duration-fast ease-water hover:text-crimson"
          >
            Trang chủ
          </Link>
          {currentCategoryName && (
            <>
              <span aria-hidden="true">›</span>
              <span
                aria-current="page"
                className="min-w-0 truncate font-medium text-ink-soft"
              >
                {currentCategoryName}
              </span>
            </>
          )}
        </nav>

        <header className="mt-6 md:mt-8">
          <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
            Cá Koi
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            Những chú cá koi phong thủy được tuyển chọn kỹ lưỡng, mang may mắn
            và bình an theo bản mệnh của bạn.
          </p>
        </header>

        <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[280px_1fr]">
          <Card className="hidden h-fit p-5 lg:sticky lg:top-24 lg:block">
            {filterPanel}
          </Card>

          <section aria-label="Danh sách cá koi" className="min-w-0">
            <details className="group lg:hidden">
              <summary className="flex list-none cursor-pointer select-none items-center justify-between gap-3 rounded-md border border-gold/40 bg-surface px-4 py-3 font-semibold text-ink shadow-plaque [&::-webkit-details-marker]:hidden">
                Lọc
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0 transition-transform duration-fast ease-water group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <Card className="mt-3 p-5">{filterPanel}</Card>
            </details>

            {loading ? (
              <div
                role="status"
                aria-label="Đang tải"
                className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:mt-0"
              >
                {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="space-y-3 p-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <EmptyState
                className="mt-6 lg:mt-0"
                title="Đã xảy ra lỗi"
                description="Không thể tải danh sách cá koi. Vui lòng thử lại."
                action={
                  <Button type="button" onClick={fetchData}>
                    Thử lại
                  </Button>
                }
              />
            ) : filteredKoi.length === 0 ? (
              <EmptyState
                className="mt-6 lg:mt-0"
                title="Không tìm thấy kết quả phù hợp"
                description="Hãy thử bỏ bớt bộ lọc bản mệnh hoặc màu sắc để xem thêm chú cá khác."
                action={
                  <Button type="button" variant="secondary" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                }
              />
            ) : (
              <>
                {hasActiveSearch && (
                  <p
                    role="status"
                    className="mb-4 text-sm font-medium text-muted"
                  >
                    {filteredKoi.length} kết quả
                  </p>
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredKoi.map((item) => (
                    <ListingCard key={item.listingId} item={item} to="/Details" />
                  ))}
                </div>

                <nav
                  aria-label="Phân trang"
                  className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 border-t border-gold/20 pt-6"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    aria-label="Trang trước"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Trang trước
                  </Button>
                  <div className="hidden items-center gap-1.5 sm:flex">
                    {pageWindow.map((page) => (
                      <button
                        key={page}
                        type="button"
                        aria-label={`Tới trang ${page}`}
                        aria-current={page === currentPage ? "page" : undefined}
                        onClick={() => handlePageChange(page)}
                        className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-sm px-2 text-sm font-semibold transition-all duration-fast ease-water active:scale-[0.98] ${
                          page === currentPage
                            ? "bg-crimson text-[#FDF6EC]"
                            : "text-ink-soft hover:bg-paper-2"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-muted">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    aria-label="Trang sau"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Trang sau
                  </Button>
                </nav>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default KoiListingPage;
