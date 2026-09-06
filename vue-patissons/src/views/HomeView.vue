<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

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
        {{ recette.titre }}
      </li>
    </ul>
  </main>
</template>