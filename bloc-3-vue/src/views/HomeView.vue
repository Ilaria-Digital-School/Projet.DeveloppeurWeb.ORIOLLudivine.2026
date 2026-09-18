<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { RouterLink } from 'vue-router'

const recettes = ref([])
const chargement = ref(true)
const erreur = ref(null)

onMounted(async () => {
  try {
    const reponse = await api.get('/recettes')
    recettes.value = reponse.data
  } catch (err) {
    console.error(err)
    erreur.value = "Impossible de charger les recettes."
  } finally {
    chargement.value = false
  }
})
</script>

<template>
  <main>
    <h1>Nos recettes</h1>

    <p v-if="chargement">Chargement en cours...</p>
    <p v-else-if="erreur">{{ erreur }}</p>

    <ul v-else>
      <li v-for="recette in recettes" :key="recette.id_recette">
        <RouterLink :to="`/recettes/${recette.id_recette}`">
          {{ recette.titre }}
          <img :src="recette.image" :alt="recette.titre" class="miniature"/>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.miniature {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  vertical-align: middle;
  margin-right: 0.5rem;
}
</style>