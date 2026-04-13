import { loadHome } from "./js/pages/Home";
import { loadFavorites } from "./js/pages/Favorites.js";

// Styles
import './css/base.css';
import './css/layout.css';
import './css/components.css';

// ===============================
// 🚀 APP INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <header class="navbar">
      <div class="logo">
        <img src="/Logo.png" alt="NearMe logo">
      </div>

      <nav class="nav-links">
        <a href="#" class="nav-item active" data-page="home">Home</a>
        <a href="#" class="nav-item" data-page="favorites">Favorites</a>
      </nav>
    </header>

    <main id="view"></main>

    <footer class="footer">
      <p>© 2026 NearMe • El Salvador 🌊</p>
    </footer>
  `;

  
  loadHomeView();

  
  setupNavigation();
}

// ===============================
//HOME VIEW
// ===============================
function loadHomeView() {
  const view = document.getElementById("view");

  view.innerHTML = `<p>Loading...</p>`;

  loadHome(); // 🔥 renderiza Home en #view
}

// ===============================
// FAVORITES VIEW
// ===============================
function loadFavoritesView() {
  const view = document.getElementById("view");

  view.innerHTML = `<p>Loading favorites...</p>`;

  loadFavorites(); 
}

// ===============================
//  NAVIGATION
// ===============================
function setupNavigation() {
  const links = document.querySelectorAll(".nav-item");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const page = link.dataset.page;

      if (page === "home") {
        loadHomeView();
      }

      if (page === "favorites") {
        loadFavoritesView();
      }
    });
  });
}