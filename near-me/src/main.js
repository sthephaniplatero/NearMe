import { searchNearbyPlaces } from "./js/services/searchService";
 
document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  app.innerHTML = "<h2>Loading places...</h2>";

  const places = await searchNearbyPlaces();

  console.log("Nearby places:", places);

  if (!places) {
    app.innerHTML = "<p>Unable to fetch nearby places. Please try again later.</p>";
    return;       
  }

  if (places.length === 0) {
    app.innerHTML = "<p>No nearby places found.</p>";
    return;
  }
}); 