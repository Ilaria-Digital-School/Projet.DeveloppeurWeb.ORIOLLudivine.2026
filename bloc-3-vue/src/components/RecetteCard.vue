<script setup>
import { computed } from 'vue'

const props = defineProps({
  recette: {
    type: Object,
    required: true,
  },
})

// "Intermédiaire" donne "badge-intermediaire" (sans accent, pour correspondre au CSS)
const classeBadge = computed(() => {
  const difficulte = props.recette.difficulte ?? ''
  const sansAccent = difficulte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return `badge-${sansAccent}`
})
</script>

<template>
  <RouterLink
    :to="`/recettes/${recette.id_recette}`"
    class="recette-card"
    :class="{ 'sans-image': !recette.image }"
  >
    <img v-if="recette.image" :src="recette.image" :alt="recette.titre" class="recette-image" />
    <p class="recette-titre">{{ recette.titre }}</p>
    <span class="badge" :class="classeBadge">
      {{ recette.difficulte }}
    </span>
    <p class="recette-description">{{ recette.description }}</p>
  </RouterLink>
</template>

<style scoped>
.recette-card {
  min-height: 450px;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
  box-shadow:
    #31190c 4px 4px 8px,
    rgba(49, 25, 12, 0.1) 5px 2px 4px;
  text-decoration: none;
}

.recette-card:hover {
  transform: scale(1.05);
}

/* Carte sans image : le contenu démarre en haut, pas de grand vide */
.recette-card.sans-image {
  min-height: auto;
  justify-content: flex-start;
}

.recette-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

/* Titre : bandeau chocolat, comme une étiquette de pâtisserie */
.recette-titre {
  display: flex;
  align-items: center;
  min-height: 5.75rem;
  margin: 0;
  padding: 16px 18px;
  background: #31190c;
  border-top: 3px solid #b84f32;
  color: #fdfaf6;
  font-size: clamp(1.35rem, 2vw, 1.6rem);
  font-style: italic;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: break-word;
  text-wrap: balance;
  transition: background-color 0.25s ease;
}

.recette-card:hover .recette-titre {
  background: #b84f32;
}

.recette-description {
  padding: 10px 15px;
  color: #31190c;
  font-style: normal;
  font-weight: 400;
  min-height: 60px;
}

.badge {
  display: inline-block;
  width: fit-content;
  font-size: 0.875rem;
  font-variant: small-caps;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 3px;
  margin: 10px 15px 0;
}

.badge-facile {
  border: 1px solid #b07a4a;
  color: #7a4f28;
  background: transparent;
}

.badge-intermediaire {
  border: 1px solid #8c6e3f;
  color: #5c4020;
  background: #faf5ee;
}

.badge-difficile {
  border: 1px solid #2c1a0e;
  color: #2c1a0e;
  background: #f0e8de;
}
</style>