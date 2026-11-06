<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import RecetteCard from '../components/RecetteCard.vue'
import { useFavorisStore } from '../stores/favoris'

const favorisStore = useFavorisStore()

const recettes = ref([])
const chargement = ref(true)
const erreur = ref(null)

onMounted(async () => {
  try {
    // On charge les favoris (identifiants) et la liste complète des recettes en même temps
    const [, reponse] = await Promise.all([favorisStore.charger(), api.get('/recettes')])
    recettes.value = reponse.data
  } catch (err) {
    console.error(err)
    erreur.value = 'Impossible de charger vos favoris.'
  } finally {
    chargement.value = false
  }
})

// L'API des favoris ne renvoie ni la difficulté ni la description : on retrouve donc
// la recette complète dans la liste, en gardant l'ordre des favoris
// (le plus récemment ajouté en premier).
const recettesFavorites = computed(() =>
  favorisStore.mesFavoris
    .map((favori) => recettes.value.find((r) => r.id_recette === favori.id_recette))
    .filter(Boolean),
)
</script>

<template>
  <main>
    <section class="favoris" aria-label="Mes recettes favorites">
      <h1>Mes favoris</h1>

      <p v-if="chargement" class="message-etat">Chargement de vos favoris...</p>
      <p v-else-if="erreur" class="message-etat" role="alert">{{ erreur }}</p>
      <p v-else-if="recettesFavorites.length === 0" class="message-etat">
        Vous n'avez pas encore de recette favorite.
        <RouterLink to="/recettes">Parcourir les recettes</RouterLink>
      </p>

      <div v-else class="grille-favoris">
        <RecetteCard
          v-for="recette in recettesFavorites"
          :key="recette.id_recette"
          :recette="recette"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.favoris {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.favoris h1 {
  font-size: clamp(28px, 4.5vw, 50px);
  font-style: italic;
  font-weight: 300;
  color: #31190c;
  text-align: center;
  margin-bottom: 30px;
}

.grille-favoris {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 40px;
  padding: 20px;
}

.message-etat {
  text-align: center;
  font-style: italic;
  color: #31190c;
}

.message-etat a {
  color: #b84f32;
}
</style>
