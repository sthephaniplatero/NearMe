import { getNearByPlaces, getPlaceDetails } from "../api/places.js";
import { createPlaceCard } from "../components/Card.js";

// 📍 Obtener ubicación
function getUserLocation() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      () => {
        // fallback San Salvador
        resolve({
          lat: 13.6929,
          lon: -89.2182
        });
      }
    );
  });
}

// 📐 Calcular distancia
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function loadHome() {
  const app = document.getElementById("app");

  app.innerHTML = `<h2>Loading nearby places...</h2>`;

  const userLocation = await getUserLocation();
  console.log("📍 USER LOCATION:", userLocation);

  // 🔥 Render de lugares
  async function renderPlaces(kinds = "", radius = 3000) {
    const results = document.getElementById("results");

    if (results) results.innerHTML = `<p>Loading...</p>`;

    const places = await getNearByPlaces(
      userLocation.lat,
      userLocation.lon,
      kinds,
      radius
    );

    if (!places || places.length === 0) {
      results.innerHTML = `<p>No places found</p>`;
      return;
    }

    let cardsHTML = "";

    for (const place of places.slice(0, 8)) {
      const xid = place.properties.xid;

      const details = await getPlaceDetails(xid);

      let image = details?.preview?.source;

      if (!image || !image.startsWith("http")) {
        image = `https://picsum.photos/seed/${xid}/300/200`;
      }

      const placeLat = place.geometry.coordinates[1];
      const placeLon = place.geometry.coordinates[0];

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        placeLat,
        placeLon
      );

      cardsHTML += createPlaceCard(place, image, distance);
    }

    results.innerHTML = cardsHTML;
  }

  // 🎯 UI
  app.innerHTML = `
    <section>
      <h2>Find Places Near You</h2>

      <div class="filters">
        <button data-type="" class="active">🌍 All</button>
        <button data-type="restaurants,cafes">🍔 Food</button>
        <button data-type="natural">🌿 Nature</button>
        <button data-type="museums">🏛️ Culture</button>
      </div>

      <div class="distance-filter">
        <label>Distance:</label>
        <select id="distanceSelect">
          <option value="1000">1 km</option>
          <option value="3000" selected>3 km</option>
          <option value="5000">5 km</option>
          <option value="10000">10 km</option>
        </select>
      </div>

      <input type="text" id="searchInput" placeholder="Search...">
      <button id="searchBtn">Search</button>

      <div id="results"></div>
    </section>
  `;

  // 🚀 carga inicial
  await renderPlaces();

  // 🔍 buscador
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  searchBtn.addEventListener("click", () => {
    const value = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = title.includes(value) ? "block" : "none";
    });
  });

  // 🎛️ filtros
  const buttons = document.querySelectorAll(".filters button");
  const distanceSelect = document.getElementById("distanceSelect");

  buttons.forEach(button => {
    button.addEventListener("click", async () => {
      const kinds = button.dataset.type;
      const radius = distanceSelect.value;

      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      await renderPlaces(kinds, radius);
    });
  });

  // 📏 cambio de distancia
  distanceSelect.addEventListener("change", async () => {
    const activeButton = document.querySelector(".filters .active");
    const kinds = activeButton ? activeButton.dataset.type : "";

    await renderPlaces(kinds, distanceSelect.value);
  });
}