const KEY = "nearme_favorites";

export function getFavorites() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function saveFavorites(favorites) {
  localStorage.setItem(KEY, JSON.stringify(favorites));
}

export function addFavorite(place) {
  const favorites = getFavorites();

  const exists = favorites.some(f => f.xid === place.xid);
  if (exists) return;

  favorites.push(place);
  saveFavorites(favorites);
}

export function removeFavorite(xid) {
  const favorites = getFavorites().filter(f => f.xid !== xid);
  saveFavorites(favorites);
}

export function isFavorite(xid) {
  return getFavorites().some(f => f.xid === xid);
}