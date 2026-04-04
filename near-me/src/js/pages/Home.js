import { searchNearbyPlaces } from "../services/searchService.js";
import { createPlaceCard } from "../components/Card.js";
import { getUserLocation } from "../services/locationService.js";

export async function loadHome() {
  const app = document.getElementById("app");

  app.innerHTML = `<h2>Loading nearby places...</h2>`;

  const { lat, lon } = await getUserLocation();
  const places = await searchNearbyPlaces();

  if (!places || places.length === 0) {
    app.innerHTML = `<h2>No nearby places found.</h2>`;
    return;
  }

  const cards = places
    .slice(0, 10)
    .map(place => createPlaceCard(place, lat, lon))
    .join("");

  app.innerHTML = `
    <section>
      <h2>Find Places Near You</h2>
      <input type="text" id="searchInput" placeholder="Search...">
      <button id="searchBtn">Search</button>
      <div id="results">${cards}</div>
    </section>
  `;

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  searchBtn.addEventListener("click", () => {
    const value = searchInput.value.toLowerCase();

    const filtered = places.filter(place => {
      const name = place.properties.name || "";
      return name.toLowerCase().includes(value);
    });

    const newCards = filtered
      .map(place => createPlaceCard(place, lat, lon))
      .join("");

    document.getElementById("results").innerHTML = newCards;
  });
}