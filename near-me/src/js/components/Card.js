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

export function createPlaceCard(place, image, distance, times) {
  const name = place.properties.name || "place";

  const fallback = `https://picsum.photos/seed/${encodeURIComponent(name)}/300/200`;

  return `
    <div class="card">
      <img 
        src="${image || fallback}" 
        alt="${name}"
        onerror="this.src='${fallback}'"
      />
      <h3>${name}</h3>
      <p class="distance">📍 ${distance} near you</p>
      <div class="times">
        <span>🚶 ${times.walk}</span>
        <span>🚗 ${times.car}</span>
      </div>
      
      
    </div>
  `;
}