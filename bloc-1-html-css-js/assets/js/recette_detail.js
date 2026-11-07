// ================================
// recette_detail.js — Pâtissons
// ================================

// ÉTAPE 1 — on lit le slug dans l'URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug");

// ÉTAPE 2 — on récupère les éléments HTML
const titre = document.getElementById("detail-titre");
const image = document.getElementById("detail-image");
const description = document.getElementById("detail-description");
const ingredients = document.getElementById("detail-ingredients");
const etapes = document.getElementById("detail-etapes");
const meta = document.getElementById("detail-meta");

// ÉTAPE 3 — on charge le JSON
fetch("../assets/data/recettes.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    const recette = data.recettes.find(function (r) {
      return r.slug === slug;
    });

    if (!recette) {
      titre.textContent = "Recette introuvable";
      return;
    }

    afficherRecette(recette);
    ajouterReferencement(recette);
  });

// ÉTAPE 4 — on affiche les données
function afficherRecette(recette) {
  // Titre
  titre.textContent = recette.titre;

  // Fil d'ariane
  document.querySelector('li[aria-current="page"]').textContent = recette.titre;

  // Image
  image.src = "../assets" + recette.images[0];
  image.alt = recette.titre;

  // Meta badges
  meta.innerHTML = `
        <span class="meta-badge">⏱ ${recette.temps.preparation_min} min</span>
        <span class="meta-badge">📊 ${recette.difficulte}</span>
        <span class="meta-badge">🍽 ${recette.portions} portions</span>
    `;

  // Description
  description.textContent = recette.description;

  // Ingrédients
  recette.ingredients.forEach(function (groupe) {
    const titreGroupe = document.createElement("li");
    titreGroupe.className = "ingredient-groupe";
    titreGroupe.textContent = groupe.groupe;
    ingredients.appendChild(titreGroupe);

    groupe.items.forEach(function (ingredient) {
      const li = document.createElement("li");
      li.className = "ingredient-item";
      li.textContent =
        ingredient.quantite +
        " " +
        (ingredient.unite || "") +
        " " +
        ingredient.nom;
      ingredients.appendChild(li);
    });
  });

  // Étapes
  recette.etapes.forEach(function (etape) {
    const li = document.createElement("li");
    li.className = "etape-item";
    li.innerHTML = `
            <span class="etape-titre">${etape.titre}</span>
            <p class="etape-description">${etape.description}</p>
        `;
    etapes.appendChild(li);
  });
}

// ÉTAPE 5 — SEO : titre, meta description et données structurées
// (Cr 1.e.3 schema.org, Cr 1.e.5 balises meta uniques par page)

// Convertit des minutes au format de durée ISO 8601 exigé par schema.org
// ex. : 25 → "PT25M" ; 360 → "PT6H" ; 385 → "PT6H25M"
function minutesEnIso(minutes) {
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  if (heures === 0) return `PT${reste}M`;
  return reste === 0 ? `PT${heures}H` : `PT${heures}H${reste}M`;
}

function ajouterReferencement(recette) {
  // Titre et description propres à chaque recette (au lieu d'un texte commun)
  document.title = `${recette.titre} - Pâtissons`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", recette.description);
  }

  // Objet au format schema.org « Recipe » (vocabulaire compris par Google)
  const donnees = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recette.titre,
    // URL absolue : new URL() complète le chemin avec l'adresse du site,
    // qu'on soit en local (Live Server) ou une fois le site déployé
    image: [
      new URL("../assets" + recette.images[0], window.location.href).href,
    ],
    description: recette.description,
    recipeCategory: "Dessert",
    keywords: recette.categorie_label,
    recipeYield: String(recette.portions),
    prepTime: minutesEnIso(recette.temps.preparation_min),
    cookTime: minutesEnIso(recette.temps.cuisson_min),
    totalTime: minutesEnIso(recette.temps.total_min),
    // Une ligne de texte par ingrédient, ex. : "145 g spéculoos concassés"
    recipeIngredient: recette.ingredients.flatMap(function (groupe) {
      return groupe.items.map(function (item) {
        return [item.quantite, item.unite, item.nom].filter(Boolean).join(" ");
      });
    }),
    // Une étape = un objet HowToStep (format recommandé par Google)
    recipeInstructions: recette.etapes.map(function (etape) {
      return {
        "@type": "HowToStep",
        name: etape.titre,
        text: etape.description,
      };
    }),
  };

  // On insère le bloc <script type="application/ld+json"> dans le <head>.
  // textContent (et non innerHTML) : le texte n'est jamais interprété comme du HTML.
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(donnees);
  document.head.appendChild(script);
}
