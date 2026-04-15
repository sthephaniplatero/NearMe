import { formatDistance } from "../utils/formatDistance.js";
import { createPlaceCard } from "../components/Card.js";
import { calculateTravelTime } from "../utils/calculateTravelTime.js";
import { getWeather } from "../services/weatherService.js";
import { getWeatherRecommendation, getRecommendedKind } from "../utils/weatherTips.js";

import {
  getNearByPlaces,
  getPlaceDetails,
  filterPlaces
} from "../api/places.js";

import {
  addFavorite,
  removeFavorite,
  isFavorite
} from "../utils/favorites.js";

// ===============================
// 🌍 VALIDACIÓN EL SALVADOR (NUEVO)
// ===============================
function isInElSalvador(lat, lon) {
  const bounds = {
    minLat: 13.0,
    maxLat: 14.5,
    minLon: -90.5,
    maxLon: -87.5
  };

  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lon >= bounds.minLon &&
    lon <= bounds.maxLon
  );
}

// ===============================
// 🧠 HELPER
// ===============================
function getKindLabel(kind) {
  if (kind === "natural") return "🌿 Nature places";
  if (kind === "restaurants,cafes") return "🍔 Food & cafes";
  if (kind === "museums") return "🏛️ Culture spots";
  return "🌍 All places";
}

// ===============================
// 📍 User location
// ===============================
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

// ===============================
// 📐 Distance
// ===============================
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
let allPlaces = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 8;

// ===============================
// 🚀 LOAD HOME
// ===============================
export async function loadHome() {
  const view = document.getElementById("view");

  view.innerHTML = `<h2>Loading nearby places...</h2>`;

  const userLocation = await getUserLocation();

  // 🚫 BLOQUEO PAÍS
  if (!isInElSalvador(userLocation.lat, userLocation.lon)) {
    view.innerHTML = `
      <section class="blocked">
        <h2>🌎 App not available</h2>
        <p>This application is only available in El Salvador 🇸🇻</p>
      </section>
    `;
    return;
  }

  // 🌤️ WEATHER
  const weather = await getWeather(userLocation.lat, userLocation.lon);
  const recommendation = getWeatherRecommendation(weather);
  const recommendedKind = getRecommendedKind(weather);

  // ===============================
  // UI
  // ===============================
  view.innerHTML = `
    <section>
      <h2>Find Places Near You</h2>

      ${
        weather ? `
        <div class="weather-card">
          <img src="${weather.icon}" alt="weather" />
          <div>
            <p><strong>${weather.temp}°C</strong> - ${weather.description}</p>
            <p>Humidity: ${weather.humidity}%</p>
            <p>Sunrise: ${weather.sunrise} | Sunset: ${weather.sunset}</p>
            <small>${recommendation}</small>
          </div>
        </div>
        ` : ""
      }

      ${
        recommendedKind
          ? `
          <div class="weather-filter-info">
            🌦️ Showing ${getKindLabel(recommendedKind)} based on current weather
          </div>
          `
          : ""
      }

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
          <option value="3000">3 km</option>
          <option value="5000">5 km</option>
          <option value="10000" selected>10 km</option>
        </select>
      </div>

      <input type="text" id="searchInput" placeholder="Search...">
      <button id="searchBtn">Search</button>

      <div id="map"></div>
      <div id="results"></div>
    </section>
  `;

  // 🎯 Activar filtro automático
  if (recommendedKind) {
    document.querySelectorAll(".filters button").forEach(btn => {
      btn.classList.remove("active");
      if (btn.dataset.type === recommendedKind) {
        btn.classList.add("active");
      }
    });
  }

  // ===============================
  // 🗺️ MAP
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

      let image = details?.preview?.source || `https://picsum.photos/seed/${xid}/300/200`;

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
      const isFav = isFavorite(xid);

      L.marker([placeLat, placeLon])
        .addTo(window.markersLayer)
        .bindPopup(`<b>${place.properties.name}</b><br>${formattedDistance}`);

      cardsHTML += createPlaceCard(
        place,
        image,
        formattedDistance,
        times,
        isFav
      );
    }

    results.innerHTML = cardsHTML;

    // ❤️ FAVORITES
    document.querySelectorAll(".fav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const xid = btn.dataset.id;

        const place = allPlaces.find(p => p.properties.xid === xid);

        const data = {
          xid,
          name: place.properties.name,
          image: btn.closest(".card").querySelector("img").src,
          distance: btn.closest(".card").querySelector(".distance").textContent
        };

        if (isFavorite(xid)) {
          removeFavorite(xid);
          btn.textContent = "🤍";
        } else {
          addFavorite(data);
          btn.textContent = "❤️";
        }
      });
    });
  }

  // 🚀 INIT
  const radius = document.getElementById("distanceSelect").value;
  await renderPlaces(recommendedKind, radius);

  // 🔍 SEARCH
  document.getElementById("searchBtn").addEventListener("click", () => {
    const value = document.getElementById("searchInput").value.toLowerCase();

    allPlaces = allPlaces.filter((p) =>
      (p.properties.name || "").toLowerCase().includes(value)
    );

    currentPage = 1;
    renderPage();
  });

  // 🎛️ FILTERS
  document.querySelectorAll(".filters button").forEach((button) => {
    button.addEventListener("click", async () => {
      const kinds = button.dataset.type;
      const radius = document.getElementById("distanceSelect").value;

      document.querySelectorAll(".filters button").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      await renderPlaces(kinds, radius);
    });
  });

  // 📏 DISTANCE
  document.getElementById("distanceSelect").addEventListener("change", async () => {
    const active = document.querySelector(".filters .active");

    await renderPlaces(
      active ? active.dataset.type : "",
      document.getElementById("distanceSelect").value
    );
  });
}