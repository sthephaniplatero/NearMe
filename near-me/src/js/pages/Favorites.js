import { createPlaceCard } from "../components/Card.js";
import { getFavorites, removeFavorite } from "../utils/favorites.js";

export function loadFavorites() {
  const view = document.getElementById("view");

  const favorites = getFavorites();

  if (favorites.length === 0) {
    view.innerHTML = `
      <section>
        <h2>❤️ Favorites</h2>
        <p>You don't have any favorite places yet.</p>
      </section>
    `;
    return;
  }

  let cardsHTML = "";

  favorites.forEach((fav) => {
   
    const placeMock = {
      properties: {
        name: fav.name,
        xid: fav.xid
      }
    };

    const times = {
      walk: "",
      car: ""
    };

    cardsHTML += createPlaceCard(
      placeMock,
      fav.image,
      fav.distance,
      times,
      true
    );
  });

  view.innerHTML = `
    <section>
      <h2>❤️ Favorites</h2>
      <div id="results">
        ${cardsHTML}
      </div>
    </section>
  `;

  //DELETE FAVORITE
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const xid = btn.dataset.id;

      removeFavorite(xid);

    
      loadFavorites();
    });
  });
}