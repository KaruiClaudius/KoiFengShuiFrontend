import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const STORAGE_KEY = "favorites";
const MAX_FAVORITES = 50;

const FavoritesContext = createContext(null);

const readFavorites = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (listingId) =>
      favorites.some((f) => String(f.listingId) === String(listingId)),
    [favorites]
  );

  const toggleFavorite = useCallback((snapshot) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => String(f.listingId) === String(snapshot.listingId)
      );
      if (exists) {
        return prev.filter(
          (f) => String(f.listingId) !== String(snapshot.listingId)
        );
      }
      return [
        {
          listingId: snapshot.listingId,
          title: snapshot.title,
          image:
            snapshot.image ?? snapshot.listingImages?.[0]?.image?.imageUrl ?? null,
          elementName: snapshot.elementName ?? null,
          accountName: snapshot.accountName ?? null,
        },
        ...prev,
      ].slice(0, MAX_FAVORITES);
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, clearFavorites }),
    [favorites, isFavorite, toggleFavorite, clearFavorites]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

FavoritesProvider.propTypes = { children: PropTypes.node };

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
};
