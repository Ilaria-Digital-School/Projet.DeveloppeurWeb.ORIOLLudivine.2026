<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const recette = ref(null)
const chargement = ref(true)
const erreur = ref(null)

onMounted(async () => {
  try {
    const reponse = await api.get(`/recettes/${route.params.id}`)
    recette.value = reponse.data
  } catch (err) {
    console.error(err)
    erreur.value = "Impossible de charger cette recette."
  } finally {
    chargement.value = false
  }
})

const etapesTriees = computed(() => {
  if (!recette.value) return []
  return [...recette.value.etapes].sort((a, b) => a.ordre - b.ordre)
})

const conseils = computed(() => {
  if (!recette.value?.conseils) return []
  try {
    return JSON.parse(recette.value.conseils)
  } catch (err) {
    console.error('Impossible de lire les conseils :', err)
    return []
  }
})

function formatDuree(minutes) {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const heures = Math.floor(minutes / 60)
  const minutesRestantes = minutes % 60
  return minutesRestantes === 0 ? `${heures} h` : `${heures} h ${minutesRestantes}`
}

// --- Suppression de la recette ---

const suppressionEnCours = ref(false)
const erreurSuppression = ref(null)

// Les boutons Modifier / Supprimer n'apparaissent que pour l'auteur de la recette ou un administrateur.
// (C'est du confort d'affichage : la vraie protection est celle de l'API.)
const peutGerer = computed(() => {
  if (!auth.estConnecte || !auth.utilisateur || !recette.value) return false
  return (
    auth.utilisateur.role === 'administrateur' ||
    auth.utilisateur.id_utilisateur === recette.value.id_utilisateur
  )
})

async function supprimer() {
  const confirme = window.confirm(
    `Supprimer définitivement la recette « ${recette.value.titre} » ? Cette action est irréversible.`,
  )
  if (!confirme) return

  erreurSuppression.value = null
  suppressionEnCours.value = true
  try {
    await api.delete(`/recettes/${route.params.id}`)
    router.push('/recettes')
  } catch (err) {
    console.error(err)
    erreurSuppression.value =
      err.response?.data?.erreur ?? 'Impossible de supprimer la recette. Veuillez réessayer.'
  } finally {
    suppressionEnCours.value = false
  }
}
</script>

<template>
  <main>
    <p v-if="chargement">Chargement en cours...</p>
    <p v-else-if="erreur">{{ erreur }}</p>

    <section v-else class="recette-detail" aria-label="Détail de la recette">
      <div class="detail-header">
        <h1>{{ recette.titre }}</h1>
        <div class="detail-meta">
          <span class="meta-badge">{{ recette.difficulte }}</span>
          <span class="meta-badge">{{ recette.portions }} portions</span>
          <span class="meta-badge">Préparation : {{ formatDuree(recette.temps_preparation) }}</span>
          <span class="meta-badge" v-if="recette.temps_cuisson > 0">
            Cuisson : {{ formatDuree(recette.temps_cuisson) }}
          </span>
          <span class="meta-badge" v-if="recette.temps_repos > 0">
            Repos : {{ formatDuree(recette.temps_repos) }}  
          </span>
        </div>
      </div>

      <img
        v-if="recette.image"
        :src="recette.image"
        :alt="recette.titre"
        class="recette-detail-image"
      />

      <p class="detail-description">{{ recette.description }}</p>

      <div class="detail-colonnes">
        <div class="detail-ingredients">
          <h2>Ingrédients</h2>
          <ul>
            <template v-for="groupe in recette.ingredients" :key="groupe.id_ingredient_groupe">
              <li class="ingredient-groupe">{{ groupe.nom_groupe }}</li>
              <li
                v-for="ingredient in groupe.ingredients"
                :key="ingredient.ordre"
                class="ingredient-item"
              >
                {{ ingredient.quantite }}{{ ingredient.unite ?? '' }} {{ ingredient.nom }}
              </li>
            </template>
          </ul>
        </div>

        <div class="detail-etapes">
          <h2>Étapes</h2>
          <ol>
            <li v-for="etape in etapesTriees" :key="etape.ordre" class="etape-item">
              <p class="etape-titre">{{ etape.titre }}</p>
              <p class="etape-description">{{ etape.description }}</p>
            </li>
          </ol>
        </div>
      </div>

      <div v-if="conseils.length" class="conseils">
        <h2>Conseils</h2>
        <div v-for="(conseil, index) in conseils" :key="index" class="conseil-item">
          <p class="conseil-titre">{{ conseil.titre }}</p>
          <p class="conseil-texte">{{ conseil.texte }}</p>
        </div>
      </div>

      <div v-if="peutGerer" class="detail-actions">
        <div class="detail-actions-boutons">
          <RouterLink :to="`/recettes/${route.params.id}/modifier`" class="btn-modifier">
            Modifier la recette
          </RouterLink>
          <button
            type="button"
            class="btn-supprimer"
            :disabled="suppressionEnCours"
            @click="supprimer"
          >
            {{ suppressionEnCours ? 'Suppression en cours…' : 'Supprimer la recette' }}
          </button>
        </div>
        <p v-if="erreurSuppression" role="alert" class="erreur-suppression">
          {{ erreurSuppression }}
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>

.recette-detail {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

.detail-header {
  text-align: center;
  margin-bottom: 30px;
}

.recette-detail h1 {
  font-size: clamp(28px, 4vw, 50px);
  font-style: italic;
  font-weight: 300;
  color: #31190c;
  margin-bottom: 16px;
}

.detail-meta {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.meta-badge {
  background: #fdfaf6;
  border: 1px solid #e8d5c0;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 18px;
  color: #b07a4a;
}

.recette-detail-image {
  width: 100%;
  max-width: 700px;
  height: 400px;
  object-fit: cover;
  display: block;
  margin: 0 auto 30px;
  border-radius: 12px;
}

.detail-description {
  max-width: 700px;
  margin: 0 auto 40px;
  text-align: center;
  font-size: 18px;
  line-height: 1.7;
  color: #8a3d14;
  font-style: italic;
}

.detail-colonnes {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  align-items: start;
}

.detail-ingredients h2,
.detail-etapes h2 {
  font-size: clamp(20px, 2.5vw, 28px);
  font-style: italic;
  font-weight: 300;
  color: #31190c;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8d5c0;
}

.detail-ingredients ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ingredient-groupe {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #b07a4a;
  margin-top: 16px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e8d5c0;
}

.ingredient-item {
  font-size: 18px;
  color: #31190c;
  padding: 4px 0 4px 12px;
  border-left: 2px solid #e8d5c0;
}

.detail-etapes ol {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  counter-reset: etape-counter;
}

.etape-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #fdfaf6;
  border: 1px solid #e8d5c0;
  border-radius: 10px;
  counter-increment: etape-counter;
  position: relative;
  padding-left: 60px;
}

.etape-item::before {
  content: counter(etape-counter);
  position: absolute;
  left: 16px;
  top: 16px;
  width: 28px;
  height: 28px;
  background: #b84f32;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}

.etape-titre {
  font-size: 19px;
  font-weight: 600;
  color: #31190c;
}

.etape-description {
  font-size: 18px;
  color: #8a3d14;
  line-height: 1.6;
  margin: 0;
}
/* Section "conseils" : pas prévue dans le Bloc 1, style ajouté par cohérence */
.conseils {
  max-width: 700px;
  margin: 50px auto 0;
}

.conseils h2 {
  font-size: clamp(20px, 2.5vw, 28px);
  font-style: italic;
  font-weight: 300;
  color: #31190c;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8d5c0;
}

.conseil-item {
  padding: 16px;
  background: #fdfaf6;
  border: 1px solid #e8d5c0;
  border-radius: 10px;
  margin-bottom: 16px;
}

.conseil-titre {
  font-size: 17px;
  font-weight: 600;
  color: #31190c;
  margin-bottom: 6px;
}

.conseil-texte {
  font-size: 16px;
  color: #8a3d14;
  line-height: 1.6;
}

/* Bouton de suppression (visible pour l'auteur ou un administrateur) */
.detail-actions {
  max-width: 700px;
  margin: 50px auto 0;
  text-align: center;
}

.detail-actions-boutons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.btn-modifier {
  display: inline-block;
  padding: 10px 24px;
  border: 1px solid #e38010;
  border-radius: 8px;
  color: #563417;
  font-size: 18px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-modifier:hover {
  background: #e8d5c0;
  color: #31190c;
}

.btn-supprimer {
  padding: 10px 24px;
  background: transparent;
  border: 1px solid #b84f32;
  border-radius: 8px;
  color: #b84f32;
  font-family: inherit;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-supprimer:hover:not(:disabled) {
  background: #b84f32;
  color: #fdfaf6;
}

.btn-supprimer:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.erreur-suppression {
  margin-top: 12px;
  color: #b84f32;
  font-style: italic;
}
</style>