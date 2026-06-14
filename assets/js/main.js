// Index.html BURGER MENU

const burger = document.getElementById("burger");
const nav = document.getElementById("header-nav");

// Ajouter un écouteur d'événement pour le clic sur le burger
burger.addEventListener("click", function () {
  nav.classList.toggle("ouvert");
});

// Fermer le menu lorsque l'utilisateur clique en dehors du menu ou du burger
document.addEventListener("click", function (event) {
  if (!nav.contains(event.target) && !burger.contains(event.target)) {
    nav.classList.remove("ouvert");
  }
});

// Apparition du texte au scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    } else {
      entry.target.classList.remove("visible"); // sort de l'écran → disparition
    }
  });
});

const introContent = document.querySelector(".intro-content");
if (introContent) {
  observer.observe(introContent);
}

// Fonction utilitaire pour la classe CSS du badge difficulté
function classeDifficulte(difficulte) {
  const d = difficulte.toLowerCase();
  if (d === "facile") return "badge-facile";
  if (d === "intermediaire") return "badge-intermediaire";
  if (d === "difficile") return "badge-difficile";
  return "badge-intermediaire"; // valeur par défaut
}

// Fonction utilitaire pour les étoiles
function etoilesDifficulte(difficulte) {
  const d = difficulte.toLowerCase();
  if (d === "facile") return "★☆☆";
  if (d === "intermediaire") return "★★☆";
  if (d === "difficile") return "★★★";
  return "★★☆";
}

// CHARGEMENT DES RECETTES SUR L'ACCUEIL
const grilleAccueil = document.getElementById("grille-accueil");
if (grilleAccueil) {
  fetch("assets/data/recettes.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const recettes = data.recettes.slice(0, 6);

      recettes.forEach(function (recette) {
        const carte = document.createElement("article");
        carte.className = "recette-card";

        carte.innerHTML = `
        <img src="assets${recette.images[0]}"
             alt="Photo de ${recette.titre}"
             class="recette-image"
             onerror="this.src='assets/images/placeholder.jpg'">
        <h3 class="recette-titre">${recette.titre}</h3>
        
        
        <span class="badge ${classeDifficulte(recette.difficulte)}">
          ${etoilesDifficulte(recette.difficulte)} ${recette.difficulte}
        </span>
        

        <p class="recette-description">${recette.description}</p>
        <a href="templates/recette_detail.html?slug=${recette.slug}"
           class="recette-lien"
           aria-label="Voir la recette : ${recette.titre}">
          Voir la recette
        </a>
      `;

        grilleAccueil.appendChild(carte);
      });
    });
}

// FILTRAGE PAR CATÉGORIE sur recettes.html
// Lit le paramètre "categorie" dans l'URL et filtre les cartes affichées

function getCategorieDepuisURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("categorie"); // ex: "cremes-curds-ganache" ou null
}
