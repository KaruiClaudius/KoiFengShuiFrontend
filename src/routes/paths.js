export const PATHS = {
  home: "/",
  auth: "/auth",
  dashboard: "/Dashboard",
  koiCompatible: "/KoiCompatible",
  profile: "/profile",
  details: (id = ":id") => `/Details/${id}`,
  decoration: (id = ":id") => `/Decoration/${id}`,
  listingPost: "/ListingPost",
  koiListings: "/KoiListings",
  faqManager: "/FAQManager",
  adminPost: "/AdminPost",
  blog: "/blog",
};
