export async function searchNearbyPlaces(kinds = "") {
  const API_KEY = import.meta.env.VITE_OPENTRIPMAP_KEY;

  const radius = 3000;
  const lat = 13.6929;
  const lon = -89.1918;

  let url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&apikey=${API_KEY}`;

if (kinds) {
  url += `&kinds=${kinds}`;
}

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.features || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}