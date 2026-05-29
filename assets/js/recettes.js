// Récupération des éléments du DOM
const grille = document.getElementById('grille-recettes');
const selectCategorie = document.getElementById('categorie');
const recherche = document.getElementById('recherche-principale');
const rechercheIngredient = document.getElementById('recherche-ingredient');
const radiosTemps = document.querySelectorAll('input[name="temps"]');
const radiosDifficulte = document.querySelectorAll('input[name="difficulte"]');

// STOCKAGE DES RECETTES
let toutesLesRecettes = [];

// FONCTION UTILITAIRE — classe CSS selon la difficulté
function classeDifficulte(difficulte) {
  const d = difficulte.toLowerCase();
  if (d === 'facile')        return 'badge-facile';
  if (d === 'intermediaire') return 'badge-intermediaire';
  if (d === 'difficile')     return 'badge-difficile';
  return 'badge-intermediaire';
}

// FONCTION UTILITAIRE — étoiles selon la difficulté
function etoilesDifficulte(difficulte) {
  const d = difficulte.toLowerCase();
  if (d === 'facile')        return '★☆☆';
  if (d === 'intermediaire') return '★★☆';
  if (d === 'difficile')     return '★★★';
  return '★★☆';
}

// FONCTION — affiche une liste de recettes dans la grille
function afficherRecettes(recettes) {
  grille.innerHTML = '';

  const favoris = JSON.parse(localStorage.getItem('favoris')) || [];

  recettes.forEach(function (recette) {
    const carte = document.createElement('article');
    carte.className = 'recette-card';

    const estFavori = favoris.includes(recette.slug);

    carte.innerHTML = `
      <div class="recette-image-wrapper">
        <img src="../assets${recette.images[0]}"
             alt="${recette.titre}"
             class="recette-image"
             onerror="this.src='../assets/images/placeholder.jpg'">
        <button class="btn-favori ${estFavori ? 'actif' : ''}"
                data-slug="${recette.slug}"
                aria-label="${estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
          ${estFavori ? '♥' : '♡'}
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

  // Écouteurs sur tous les boutons cœur
  document.querySelectorAll('.btn-favori').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.stopPropagation();
      event.preventDefault();

      const slug = btn.dataset.slug;
      const favoris = JSON.parse(localStorage.getItem('favoris')) || [];

      if (favoris.includes(slug)) {
        const nouveauxFavoris = favoris.filter(function (s) { return s !== slug; });
        localStorage.setItem('favoris', JSON.stringify(nouveauxFavoris));
        btn.classList.remove('actif');
        btn.textContent = '♡';
        btn.setAttribute('aria-label', 'Ajouter aux favoris');
      } else {
        favoris.push(slug);
        localStorage.setItem('favoris', JSON.stringify(favoris));
        btn.classList.add('actif');
        btn.textContent = '♥';
        btn.setAttribute('aria-label', 'Retirer des favoris');
      }
    });
  });
}

// CHARGEMENT DES RECETTES
fetch('../assets/data/recettes.json')
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    toutesLesRecettes = data.recettes;
    afficherRecettes(toutesLesRecettes);
  })
  .catch(function (erreur) {
    console.error('Erreur de chargement :', erreur);
    grille.innerHTML = '<p>Impossible de charger les recettes. Veuillez réessayer.</p>';
  }); 
  

// FONCTION — filtre par temps
function filtrerParTemps(recette, valeurTemps) {
  const tempsTotal = recette.temps.preparation_min;
  if (valeurTemps === 'moins30') return tempsTotal < 30;
  if (valeurTemps === 'moins1h') return tempsTotal < 60;
  if (valeurTemps === 'plus1h')  return tempsTotal >= 60;
}

// FONCTION — filtre les recettes
function filtrerRecettes() {
  const valeurRecherche = recherche.value.toLowerCase();
  const valeurCategorie = selectCategorie.value;
  const valeurIngredient = rechercheIngredient.value.toLowerCase();

  const radioTempsCoche = document.querySelector('input[name="temps"]:checked');
  const valeurTemps = radioTempsCoche ? radioTempsCoche.value : '';

  const radioDifficulteCoche = document.querySelector('input[name="difficulte"]:checked');
  const valeurDifficulte = radioDifficulteCoche ? radioDifficulteCoche.value : '';

  const recettesFiltrees = toutesLesRecettes.filter(function (recette) {
    const ingredientTrouve = valeurIngredient === '' || recette.ingredients.some(function (groupe) {
      return groupe.items.some(function (item) {
        return item.nom.toLowerCase().includes(valeurIngredient);
      });
    });

    return recette.titre.toLowerCase().includes(valeurRecherche) &&
           (valeurCategorie === '' || recette.categorie === valeurCategorie) &&
           (valeurDifficulte === '' || recette.difficulte.toLowerCase() === valeurDifficulte) &&
           (valeurTemps === '' || filtrerParTemps(recette, valeurTemps)) &&
           ingredientTrouve;
  });

  afficherRecettes(recettesFiltrees);
}

// ÉCOUTEURS D'ÉVÉNEMENTS
recherche.addEventListener('input', filtrerRecettes);
selectCategorie.addEventListener('change', filtrerRecettes);
rechercheIngredient.addEventListener('input', filtrerRecettes);

radiosTemps.forEach(function (radio) {
  radio.addEventListener('change', filtrerRecettes);
});

radiosDifficulte.forEach(function (radio) {
  radio.addEventListener('change', filtrerRecettes);
});

// BOUTON RESET
const btnReset = document.getElementById('btn-reset');

btnReset.addEventListener('click', function () {
  recherche.value = '';
  selectCategorie.value = '';
  rechercheIngredient.value = '';

  radiosTemps.forEach(function (radio) { radio.checked = false; });
  radiosDifficulte.forEach(function (radio) { radio.checked = false; });

  afficherRecettes(toutesLesRecettes);
});
