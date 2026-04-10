// ================================
// 📍 OBTENER LUGARES CERCANOS
// ================================
export async function getNearByPlaces(lat, lon, kinds = "", radius = 3000) {
  const API_KEY = import.meta.env.VITE_OPENTRIPMAP_KEY;

  if (!lat || !lon) {
    console.error("❌ Missing coordinates:", { lat, lon });
    return [];
  }

  let url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&apikey=${API_KEY}`;

  if (kinds && kinds.trim() !== "") {
    url += `&kinds=${kinds}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("❌ API Error:", response.status);
      return [];
    }

    const data = await response.json();

    return data.features || [];
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
}


// ================================
// 📌 DETALLE DE UN LUGAR
// ================================
export async function getPlaceDetails(xid) {
  const API_KEY = import.meta.env.VITE_OPENTRIPMAP_KEY;

  if (!xid) return null;

  const url = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("❌ API Error:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching details:", error);
    return null;
  }
}

// ================================
// 🧹 FILTRO DE LUGARES
// ================================
export function filterPlaces(places) {
  const blockedWords = [
    "place",
    "church",
    "iglesia",
    "temple",
    "mosque",
    "capilla"
  ];

  return places.filter((p) => {
    const name = (p?.properties?.name || "").toLowerCase();

    const isBadName = blockedWords.some(word =>
      name.includes(word)
    );

    const isEmpty = !name || name.trim() === "";

    return !isBadName && !isEmpty;
  });
}


// ================================
// 📄 PAGINACIÓN
// ================================
export function paginatePlaces(places, page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const end = start + limit;

  return places.slice(start, end);
}

