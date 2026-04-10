import { formatDistance } from "../utils/formatDistance.js";
import { createPlaceCard } from "../components/Card.js";


import {
  getNearByPlaces,
  getPlaceDetails,
  filterPlaces
} from "../api/places.js";


// 📍 Ubicación usuario
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
        resolve({
          lat: 13.6929,
          lon: -89.2182
        });
      }
    );
  });
}

// 📐 Distancia
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

// ===============================
// 🔥 ESTADO GLOBAL
// ===============================
let allPlaces = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

export async function loadHome() {
  const app = document.getElementById("app");

  app.innerHTML = `<h2>Loading nearby places...</h2>`;

  const userLocation = await getUserLocation();

  // ===============================
  // 🎯 RENDER
  // ===============================
  async function renderPlaces(kinds = "", radius = 3000, reset = true) {
    const results = document.getElementById("results");

    if (reset) {
      results.innerHTML = `<p>Loading...</p>`;
      currentPage = 1;
    }

    const places = await getNearByPlaces(
      userLocation.lat,
      userLocation.lon,
      kinds,
      radius
    );

    // 🧹 limpiar data basura
    allPlaces = filterPlaces(places);

    renderPage();
  }



  // ===============================
  // 📄 RENDER PAGINADO
  // ===============================
  async function renderPage() {
    const results = document.getElementById("results");

    const start = 0;
    const end = currentPage * ITEMS_PER_PAGE;

    const pageData = allPlaces.slice(start, end);

    let cardsHTML = "";

    for (const place of pageData) {
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

      const formattedDistance = formatDistance(distance);

      cardsHTML += createPlaceCard(place, image, formattedDistance);
    }

    // botón ver más
    const hasMore = end < allPlaces.length;

    results.innerHTML = `
      ${cardsHTML}

      ${
        hasMore
          ? `<button id="loadMore" class="load-more">Ver más</button>`
          : `<p>No hay más lugares</p>`
      }
    `;

    // evento botón
    const loadMoreBtn = document.getElementById("loadMore");

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        currentPage++;
        renderPage();
      });
    }
  }

  // ===============================
  // 🎯 UI
  // ===============================
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

  // 🔍 buscador (sobre data real)
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  searchBtn.addEventListener("click", () => {
    const value = searchInput.value.toLowerCase();

    const filtered = allPlaces.filter((p) =>
      (p.properties.name || "").toLowerCase().includes(value)
    );

    allPlaces = filtered;
    currentPage = 1;
    renderPage();
  });

  // 🎛️ filtros
  const buttons = document.querySelectorAll(".filters button");
  const distanceSelect = document.getElementById("distanceSelect");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const kinds = button.dataset.type;
      const radius = distanceSelect.value;

      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      await renderPlaces(kinds, radius);
    });
  });

  // 📏 distancia
  distanceSelect.addEventListener("change", async () => {
    const activeButton = document.querySelector(".filters .active");
    const kinds = activeButton ? activeButton.dataset.type : "";

    await renderPlaces(kinds, distanceSelect.value);
  });
}