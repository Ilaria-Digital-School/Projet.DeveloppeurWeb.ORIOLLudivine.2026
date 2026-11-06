<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import RecetteCard from '../components/RecetteCard.vue' // À VÉRIFIER : chemin du composant

const route = useRoute()

// Données de l'API
const recettes = ref([])
const chargement = ref(true)
const erreur = ref(null)

// Valeurs des filtres (liées aux champs du formulaire avec v-model)
const recherche = ref('')
const categorie = ref(route.query.categorie ?? '') // pré-remplie par /recettes?categorie=slug
const temps = ref('')
const difficulte = ref('')

// Si l'URL change (ex. clic sur une catégorie depuis l'accueil), on met le filtre à jour
watch(
  () => route.query.categorie,
  (nouvelle) => {
    categorie.value = nouvelle ?? ''
  },
)

onMounted(async () => {
  try {
    const reponse = await api.get('/recettes')
    recettes.value = reponse.data // À VÉRIFIER : forme de la réponse de l'API
    console.log([...new Set(reponse.data.map((r) => r.categorie))])
  } catch (err) {
    console.error(err)
    erreur.value = 'Impossible de charger les recettes. Veuillez réessayer.'
  } finally {
    chargement.value = false
  }
})

// Met un texte en minuscules et retire les accents : "Crème" devient "creme"
function normaliser(texte) {
  return String(texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function correspondTemps(recette) {
  const minutes = recette.temps_preparation
  if (temps.value === 'moins30') return minutes < 30
  if (temps.value === 'moins1h') return minutes < 60
  if (temps.value === 'plus1h') return minutes >= 60
  return true
}

// Correspondance entre le slug (menu et URL) et le nom renvoyé par l'API
const nomsCategories = {
  'cremes-curds-ganache': 'Crèmes, curds et ganache',
  'pates-biscuits': 'Pâtes et biscuits',
  'tartes-millefeuilles': 'Tartes et millefeuilles',
  'entremets-gateaux-montes': 'Entremets et gâteaux montés',
  'patisseries-individuelles': 'Pâtisseries individuelles',
  'autres-gourmandises': 'Autres gourmandises',
}

// Liste recalculée automatiquement dès qu'un filtre change
const recettesFiltrees = computed(() => {
  const terme = normaliser(recherche.value)

  return recettes.value.filter((recette) => {
    return (
      normaliser(recette.titre).includes(terme) &&
      (categorie.value === '' || recette.categorie === nomsCategories[categorie.value]) &&
      (difficulte.value === '' || normaliser(recette.difficulte) === difficulte.value) &&
      (temps.value === '' || correspondTemps(recette))
    )
  })
})

function reinitialiser() {
  recherche.value = ''
  categorie.value = ''
  temps.value = ''
  difficulte.value = ''
}
</script>

<template>
  <main>
    <nav aria-label="Fil d'ariane" class="fil-ariane">
      <ol>
        <li><RouterLink to="/">Accueil</RouterLink></li>
        <li aria-current="page">Recettes</li>
      </ol>
    </nav>

    <div class="recettes-layout">
      <aside class="filtres" aria-label="Filtres de recherche">
        <div class="filtre-groupe">
          <label for="recherche-principale">Rechercher une recette</label>
          <input
            id="recherche-principale"
            v-model="recherche"
            type="search"
            name="recherche"
            placeholder="Rechercher une recette..."
          />
        </div>

        <div class="filtre-groupe">
          <label for="categorie">Catégorie</label>
          <select id="categorie" v-model="categorie" name="categorie">
            <option value="">Toutes les catégories</option>
            <option value="cremes-curds-ganache">Crèmes, curds et ganache</option>
            <option value="pates-biscuits">Pâtes et biscuits</option>
            <option value="tartes-millefeuilles">Tartes et millefeuilles</option>
            <option value="entremets-gateaux-montes">Entremets et gâteaux montés</option>
            <option value="patisseries-individuelles">Pâtisseries individuelles</option>
            <option value="autres-gourmandises">Autres gourmandises</option>
          </select>
        </div>

        <fieldset>
          <legend>Temps de préparation</legend>
          <label>
            <input v-model="temps" type="radio" name="temps" value="moins30" />
            <span>Moins de 30 min</span>
          </label>
          <label>
            <input v-model="temps" type="radio" name="temps" value="moins1h" />
            <span>Moins d'1h</span>
          </label>
          <label>
            <input v-model="temps" type="radio" name="temps" value="plus1h" />
            <span>Plus d'1h</span>
          </label>
        </fieldset>

        <fieldset>
          <legend>Difficulté</legend>
          <label>
            <input v-model="difficulte" type="radio" name="difficulte" value="facile" />
            <span>Facile</span>
          </label>
          <label>
            <input v-model="difficulte" type="radio" name="difficulte" value="intermediaire" />
            <span>Intermédiaire</span>
          </label>
          <label>
            <input v-model="difficulte" type="radio" name="difficulte" value="difficile" />
            <span>Difficile</span>
          </label>
        </fieldset>

        <button type="button" class="btn-reset" @click="reinitialiser">
          Réinitialiser les filtres
        </button>
      </aside>

      <section class="resultats" aria-label="Résultats des recettes">
        <h1>Résultats de la recherche</h1>

        <p v-if="chargement" class="message-etat">Chargement des recettes...</p>
        <p v-else-if="erreur" class="message-etat" role="alert">{{ erreur }}</p>
        <p v-else-if="recettesFiltrees.length === 0" class="message-etat">
          Aucune recette ne correspond à votre recherche.
        </p>

        <div v-else class="container_resultats">
          <RecetteCard
            v-for="recette in recettesFiltrees"
            :key="recette.id_recette"
            :recette="recette"
          />
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* ===== FIL D'ARIANE ===== */
.fil-ariane {
  padding: 15px 40px;
  background-color: #fdfaf6;
  border-bottom: 1px solid rgba(93, 55, 28, 0.1);
}

.fil-ariane ol {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  font-size: clamp(12px, 1.2vw, 14px);
}

.fil-ariane li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #31190c;
}

.fil-ariane li + li::before {
  content: '›';
  color: #b07a4a;
  font-size: 18px;
  line-height: 1;
}

.fil-ariane a {
  color: #b84f32;
  text-decoration: none;
}

.fil-ariane a:hover {
  text-decoration: underline;
}

.fil-ariane li[aria-current='page'] {
  color: #31190c;
  font-style: italic;
}

/* ===== LAYOUT RECETTES ===== */
.recettes-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  padding: 2rem 2rem 2rem 1rem;
  max-width: 1200px;
  margin: 30px 40px;
}

/* ===== ASIDE FILTRES ===== */
.filtres {
  background-color: #f3eade;
  border: 1px solid #633a0d;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  height: fit-content;
}

.filtres::before {
  content: 'Filtrer les recettes';
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #b84f32;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8d5c0;
}

.filtres label {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #31190c;
  display: block;
  margin-bottom: 4px;
}

.filtres input[type='search'],
.filtres select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #e8d5c0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 16px;
  color: #31190c;
  outline: none;
  transition: border-color 0.2s ease;
}

.filtres fieldset {
  border: 1px solid #e8d5c0;
  border-radius: 8px;
  padding: 10px 14px;
  padding-top: 1.5rem;
  margin: 0;
  background: #f3eade;
  position: relative;
}

.filtres legend {
  position: absolute;
  top: -0.7rem;
  left: 1rem;
  background: #f3eade;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3e2017;
  padding: 0 6px;
}

.filtres fieldset label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: #31190c;
  cursor: pointer;
}

.filtres input[type='radio'] {
  accent-color: #b84f32;
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.btn-reset {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid #e38010;
  border-radius: 8px;
  color: #563417;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  font-weight: 600;
  font-style: normal;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: #e8d5c0;
  color: #31190c;
}

/* ===== RÉSULTATS ===== */
.resultats h1 {
  font-size: clamp(28px, 4.5vw, 50px);
  margin: 30px;
  text-align: center;
  font-style: italic;
}

.container_resultats {
  padding: 20px 40px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.message-etat {
  text-align: center;
  color: #31190c;
  font-style: italic;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1170px) {
  .recettes-layout {
    grid-template-columns: 260px 1fr;
    margin: 20px 20px;
  }

  .container_resultats {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .fil-ariane {
    padding: 15px 20px;
  }

  .recettes-layout {
    grid-template-columns: 1fr;
    margin: 10px 15px;
    padding: 1rem;
  }

  .filtres {
    width: 100%;
  }

  .container_resultats {
    grid-template-columns: 1fr;
    padding: 10px 0;
    gap: 20px;
  }

  .resultats h1 {
    margin-top: 30px;
  }
}
</style>
