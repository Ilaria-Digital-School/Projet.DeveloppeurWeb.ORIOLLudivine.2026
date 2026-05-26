// Récupération des éléments du DOM
const grille = document.getElementById('grille-recettes');
const selectCategorie = document.getElementById('categorie');
const recherche = document.getElementById('recherche-principale');
const rechercheIngredient = document.getElementById('recherche-ingredient');
const radiosTemps = document.querySelectorAll('input[name="temps"]');
const radiosDifficulte = document.querySelectorAll('input[name="difficulte"]');

// STOCKAGE DES RECETTES
let toutesLesRecettes = [];

// FONCTION — crée les cartes HTML
function afficherRecettes(recettes) {
    grille.innerHTML = '';

    recettes.forEach(function(recette) {
        const carte = document.createElement('article');
        carte.className = 'recette-card';

        carte.innerHTML = `
    <img src="../assets${recette.images[0]}" 
         alt="${recette.titre}" 
         class="recette-image"
         onerror="this.src='../assets/images/placeholder.jpg'">
    <h3 class="recette-titre">${recette.titre}</h3>
    <p class="recette-description">${recette.description}</p>
    <a href="recette_detail.html?slug=${recette.slug}" 
       class="recette-lien"
       aria-label="Voir la recette : ${recette.titre}">
       Voir la recette
    </a>
`;
        grille.appendChild(carte);
    });
}

// FONCTION — filtre par temps
function filtrerParTemps(recette, valeurTemps) {
    const tempsTotal = recette.temps.preparation_min;

    if (valeurTemps === 'moins30') {
        return tempsTotal < 30;
    } else if (valeurTemps === 'moins1h') {
        return tempsTotal < 60;
    } else if (valeurTemps === 'plus1h') {
        return tempsTotal >= 60;
    }
}

// FONCTION — filtre les recettes
function filtrerRecettes() {
    const valeurRecherche = recherche.value.toLowerCase();
    const valeurCategorie = selectCategorie.value;
    const valeurIngredient = rechercheIngredient.value.toLowerCase(); // ← ajouté

    const radioTempsCoche = document.querySelector('input[name="temps"]:checked');
    const valeurTemps = radioTempsCoche ? radioTempsCoche.value : '';

    const radioDifficulteCoche = document.querySelector('input[name="difficulte"]:checked');
    const valeurDifficulte = radioDifficulteCoche ? radioDifficulteCoche.value : '';

    const recettesFiltrees = toutesLesRecettes.filter(function(recette) {

        // Vérifie si l'ingrédient est dans la recette 
        const ingredientTrouve = valeurIngredient === '' || recette.ingredients.some(function(groupe) {
            return groupe.items.some(function(item) {
                return item.nom.toLowerCase().includes(valeurIngredient);
            });
        });

        return recette.titre.toLowerCase().includes(valeurRecherche) &&
               (valeurCategorie === '' || recette.categorie === valeurCategorie) &&
               (valeurDifficulte === '' || recette.difficulte.toLowerCase() === valeurDifficulte) &&
               (valeurTemps === '' || filtrerParTemps(recette, valeurTemps)) &&
               ingredientTrouve; // ← ajouté
    });

    afficherRecettes(recettesFiltrees);
}

// ÉCOUTEURS D'ÉVÉNEMENTS
recherche.addEventListener('input', filtrerRecettes);
selectCategorie.addEventListener('change', filtrerRecettes);
rechercheIngredient.addEventListener('input', filtrerRecettes); // ← ajouté

radiosTemps.forEach(function(radio) {
    radio.addEventListener('change', filtrerRecettes);
});

radiosDifficulte.forEach(function(radio) {
    radio.addEventListener('change', filtrerRecettes);
});

// BOUTON RESET
const btnReset = document.getElementById('btn-reset');

btnReset.addEventListener('click', function() {
    recherche.value = '';
    selectCategorie.value = '';
    rechercheIngredient.value = ''; // ← ajouté

    radiosTemps.forEach(function(radio) {
        radio.checked = false;
    });

    radiosDifficulte.forEach(function(radio) {
        radio.checked = false;
    });

    afficherRecettes(toutesLesRecettes);
});

// CHARGEMENT DU JSON
fetch('../assets/data/recettes.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        toutesLesRecettes = data.recettes;
        afficherRecettes(toutesLesRecettes);
    });