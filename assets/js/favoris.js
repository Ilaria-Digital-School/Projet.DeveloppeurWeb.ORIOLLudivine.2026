// ============================================================
//  favoris.js — Page "Mes favoris" (Bloc 1 — JS vanilla)
//  Lit les slugs sauvegardés dans localStorage,
//  charge recettes.json, puis affiche uniquement les favoris.
// ============================================================

// ÉLÉMENTS DU DOM
const grille = document.getElementById("grille-favoris");

// ─────────────────────────────────────────
//  FONCTIONS UTILITAIRES (copiées de recettes.js
//  pour que favoris.js soit autonome)
// ─────────────────────────────────────────

function classeDifficulte(difficulte) {
  const d = difficulte.toLowerCase();
  if (d === "facile") return "badge-facile";
  if (d === "intermediaire") return "badge-intermediaire";
  if (d === "difficile") return "badge-difficile";
  return "badge-intermediaire";
}

function etoilesDifficulte(difficulte) {
  const d = difficulte.toLowerCase();
  if (d === "facile") return "★☆☆";
  if (d === "intermediaire") return "★★☆";
  if (d === "difficile") return "★★★";
  return "★★☆";
}

// ─────────────────────────────────────────
//  AFFICHAGE DES CARTES
// ─────────────────────────────────────────

function afficherFavoris(recettes) {
  grille.innerHTML = "";

  recettes.forEach(function (recette) {
    const carte = document.createElement("article");
    carte.className = "recette-card";

    carte.innerHTML = `
      <div class="recette-image-wrapper">
        <img src="../assets${recette.images[0]}"
             alt="${recette.titre}"
             class="recette-image"
             onerror="this.src='../assets/images/placeholder.jpg'">
        <button class="btn-favori actif"
                data-slug="${recette.slug}"
                aria-label="Retirer des favoris">
          ♥
        </button>
      </div>

      <h3 class="recette-titre">${recette.titre}</h3>

      <span class="badge ${classeDifficulte(recette.difficulte)}">
        ${etoilesDifficulte(recette.difficulte)} ${recette.difficulte}
      </span>

      <p class="recette-description">${recette.description}</p>

      <a href="recette_detail.html?slug=${recette.slug}"
         class="recette-lien"
         aria-label="Voir la recette : ${recette.titre}">
        Voir la recette
      </a>
    `;

    grille.appendChild(carte);
  });

  // Écouteurs sur les boutons cœur : retirer un favori
  document.querySelectorAll(".btn-favori").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      event.preventDefault();

      const slug = btn.dataset.slug;

      // Mise à jour du localStorage
      const favoris = JSON.parse(localStorage.getItem("favoris")) || [];
      const nouveauxFavoris = favoris.filter(function (s) {
        return s !== slug;
      });
      localStorage.setItem("favoris", JSON.stringify(nouveauxFavoris));

      // Suppression visuelle de la carte avec animation
      const carte = btn.closest(".recette-card");
      carte.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      carte.style.opacity = "0";
      carte.style.transform = "scale(0.95)";

      setTimeout(function () {
        carte.remove();
      }, 300);
    });
  });
}

// ─────────────────────────────────────────
//  CHARGEMENT ET FILTRAGE
// ─────────────────────────────────────────

fetch("../assets/data/recettes.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // Lecture des slugs favoris dans localStorage
    const slugsFavoris = JSON.parse(localStorage.getItem("favoris")) || [];

    // On garde uniquement les recettes dont le slug est dans les favoris
    const recettesFavorites = data.recettes.filter(function (recette) {
      return slugsFavoris.includes(recette.slug);
    });

    afficherFavoris(recettesFavorites);
  });
