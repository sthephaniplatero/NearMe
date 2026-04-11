import { formatDistance } from "../utils/formatDistance.js";
import { createPlaceCard } from "../components/Card.js";
import { calculateTravelTime } from "../utils/calculateTravelTime.js";

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
  const view = document.getElementById("view"); // 🔥 CAMBIO CLAVE

  view.innerHTML = `<h2>Loading nearby places...</h2>`;

  const userLocation = await getUserLocation();

  // ===============================
  // 🎯 UI
  // ===============================
  view.innerHTML = `
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

      <div id="map"></div>
      <div id="results"></div>
    </section>
  `;

  // ===============================
  // 🗺️ MAPA
  // ===============================
  let map = L.map("map").setView(
    [userLocation.lat, userLocation.lon],
    13
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  L.marker([userLocation.lat, userLocation.lon])
    .addTo(map)
    .bindPopup("You are here 📍")
    .openPopup();

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

    allPlaces = filterPlaces(places);

    renderPage();
  }

  // ===============================
  // 📄 PAGINACIÓN
  // ===============================
  async function renderPage() {
    const results = document.getElementById("results");

    const end = currentPage * ITEMS_PER_PAGE;
    const pageData = allPlaces.slice(0, end);

    let cardsHTML = "";

    if (window.markersLayer) {
      window.markersLayer.clearLayers();
    }

    window.markersLayer = L.layerGroup().addTo(map);

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
      const times = calculateTravelTime(distance);

      // 📍 marker
      L.marker([placeLat, placeLon])
        .addTo(window.markersLayer)
        .bindPopup(`
          <b>${place.properties.name}</b><br>
          ${formattedDistance}<br>
          🚶 ${times.walk} | 🚗 ${times.car}
        `);

      cardsHTML += createPlaceCard(
        place,
        image,
        formattedDistance,
        times
      );
    }

    const hasMore = end < allPlaces.length;

    results.innerHTML = `
      ${cardsHTML}
      ${
        hasMore
          ? `<button id="loadMore" class="load-more">Ver más</button>`
          : `<p>No hay más lugares</p>`
      }
    `;

    const loadMoreBtn = document.getElementById("loadMore");

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        currentPage++;
        renderPage();
      });
    }
  }

  // 🚀 inicial
  await renderPlaces();

  // 🔍 search
  document.getElementById("searchBtn").addEventListener("click", () => {
    const value = document
      .getElementById("searchInput")
      .value.toLowerCase();

    allPlaces = allPlaces.filter((p) =>
      (p.properties.name || "").toLowerCase().includes(value)
    );

    currentPage = 1;
    renderPage();
  });

  // 🎛️ filtros
  document.querySelectorAll(".filters button").forEach((button) => {
    button.addEventListener("click", async () => {
      const kinds = button.dataset.type;
      const radius = document.getElementById("distanceSelect").value;

      document
        .querySelectorAll(".filters button")
        .forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");

      await renderPlaces(kinds, radius);
    });
  });

  // 📏 distancia
  document
    .getElementById("distanceSelect")
    .addEventListener("change", async () => {
      const active = document.querySelector(".filters .active");

      await renderPlaces(
        active ? active.dataset.type : "",
        document.getElementById("distanceSelect").value
      );
    });
}