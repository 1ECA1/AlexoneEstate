
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

import api, { TOKEN_KEY } from "../services/api";
import { normalizeProperty } from "../utils/normalizeProperty";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const location = useLocation();

  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setFavorites([]);
      return;
    }

    setLoadingFavorites(true);

    try {
      const { data } = await api.get("/favorites");
      const properties = (data.data || []).map(normalizeProperty);
      setFavorites(properties);
    } catch (error) {
      if (error.response?.status === 401 ||
          error.response?.status === 403) {
        setFavorites([]);
      } else {
        console.error("Failed to load favorites:", error);
      }
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  // Refresh after navigation, including after login.
  useEffect(() => {
    refreshFavorites();
  }, [location.pathname, refreshFavorites]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((property) => String(property.id))),
    [favorites]
  );

  const isFavorite = useCallback(
    (propertyId) => favoriteIds.has(String(propertyId)),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (propertyId) => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        return { requiresLogin: true };
      }

      const id = String(propertyId);

      if (favoriteIds.has(id)) {
        await api.delete(`/favorites/${id}`);

        setFavorites((current) =>
          current.filter((property) => String(property.id) !== id)
        );
      } else {
        await api.post(`/favorites/${id}`);
        await refreshFavorites();
      }

      return { success: true };
    },
    [favoriteIds, refreshFavorites]
  );

  const value = useMemo(
    () => ({
      favorites,
      loadingFavorites,
      isFavorite,
      toggleFavorite,
      refreshFavorites,
    }),
    [
      favorites,
      loadingFavorites,
      isFavorite,
      toggleFavorite,
      refreshFavorites,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavorites must be used inside FavoritesProvider"
    );
  }

  return context;
}
