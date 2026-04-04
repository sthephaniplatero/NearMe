function translateCategory(kinds) {
  if (!kinds) return "Sin categoría";

  if (kinds.includes("church")) return "Iglesia ⛪";
  if (kinds.includes("park")) return "Parque 🌳";
  if (kinds.includes("restaurant")) return "Restaurante 🍽️";
  if (kinds.includes("school")) return "Escuela 🎓";

  return "Lugar";
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (R * c).toFixed(2);
}

export function createPlaceCard(place, userLat, userLon) {
  const name =
    place.properties.name ||
    place.properties.kinds?.split(",")[0] ||
    "Lugar sin nombre";

  const category = translateCategory(place.properties.kinds);

  // 🔥 OPCIÓN 1: usar distancia de API (más simple)
  const distance = place.properties.dist
    ? (place.properties.dist / 1000).toFixed(1) + " km"
    : "N/A";

  // 🔥 OPCIÓN 2 (mejor): calcularla tú
  /*
  const distance = place.geometry
    ? calculateDistance(
        userLat,
        userLon,
        place.geometry.coordinates[1],
        place.geometry.coordinates[0]
      ) + " km"
    : "N/A";
  */

  return `
    <div class="card">
      <div class="card-content">
        <h3>${name}</h3>
        <p>${category}</p>
        <p>📍 ${distance}</p>
      </div>
    </div>
  `;
}