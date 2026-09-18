<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()

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
</script>

<template>
  <main>
    <p v-if="chargement">Chargement en cours...</p>
    <p v-else-if="erreur">{{ erreur }}</p>

    <div v-else>
      <h1>{{ recette.titre }}</h1>
      <img :src="recette.image" :alt="recette.titre" class="photo-recette" />
      <p>{{ recette.description }}</p>
      <p>Difficulté : {{ recette.difficulte }}</p>
      <p>Préparation : {{ recette.temps_preparation }} min</p>
    </div>
  </main>
</template>

<style scoped>
.photo-recette {
  max-width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
}
</style>