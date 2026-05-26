// ================================
// recette_detail.js — Pâtissons
// ================================

// ÉTAPE 1 — on lit le slug dans l'URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// ÉTAPE 2 — on récupère les éléments HTML
const titre = document.getElementById('detail-titre');
const image = document.getElementById('detail-image');
const description = document.getElementById('detail-description');
const ingredients = document.getElementById('detail-ingredients');
const etapes = document.getElementById('detail-etapes');
const meta = document.getElementById('detail-meta');

// ÉTAPE 3 — on charge le JSON
fetch('../assets/data/recettes.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        const recette = data.recettes.find(function(r) {
            return r.slug === slug;
        });

        if (!recette) {
            titre.textContent = 'Recette introuvable';
            return;
        }

        afficherRecette(recette);
    });

// ÉTAPE 4 — on affiche les données
function afficherRecette(recette) {

    // Titre
    titre.textContent = recette.titre;

    // Fil d'ariane
    document.querySelector('li[aria-current="page"]').textContent = recette.titre;

    // Image
    image.src = '../assets' + recette.images[0];
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
    recette.ingredients.forEach(function(groupe) {
        const titreGroupe = document.createElement('li');
        titreGroupe.className = 'ingredient-groupe';
        titreGroupe.textContent = groupe.groupe;
        ingredients.appendChild(titreGroupe);

        groupe.items.forEach(function(ingredient) {
            const li = document.createElement('li');
            li.className = 'ingredient-item';
            li.textContent = ingredient.quantite + ' ' + (ingredient.unite || '') + ' ' + ingredient.nom;
            ingredients.appendChild(li);
        });
    });

    // Étapes
    recette.etapes.forEach(function(etape) {
        const li = document.createElement('li');
        li.className = 'etape-item';
        li.innerHTML = `
            <span class="etape-titre">${etape.titre}</span>
            <p class="etape-description">${etape.description}</p>
        `;
        etapes.appendChild(li);
    });
}