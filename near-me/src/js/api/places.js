// 📍 Obtener lugares cercanos
export async function getNearByPlaces(lat, lon, kinds = "", radius = 3000) {
  const API_KEY = import.meta.env.VITE_OPENTRIPMAP_KEY;

  if (!lat || !lon) {
    console.error("❌ Missing coordinates:", { lat, lon });
    return [];
  }

  // 🔥 Construir URL correctamente
  let url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&apikey=${API_KEY}`;

  // ✅ Solo agregar kinds si existe
  if (kinds && kinds.trim() !== "") {
    url += `&kinds=${kinds}`;
  }

  console.log("🚀 URL:", url);

  try {
    const response = await fetch(url);

    // 🔥 Validar respuesta (pro tip)
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

// 📌 Obtener detalles de un lugar
export async function getPlaceDetails(xid) {
  const API_KEY = import.meta.env.VITE_OPENTRIPMAP_KEY;

  if (!xid) {
    console.error("❌ Missing xid:", xid);
    return null;
  }

  const url = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${API_KEY}`;

  try {
    const response = await fetch(url);

    // 🔥 Validar respuesta
    if (!response.ok) {
      console.error("❌ API Error (details):", response.status);
      return null;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}