<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../services/api'
import RecetteCard from '../components/RecetteCard.vue'

const categories = [
  { slug: 'cremes-curds-ganache', nom: 'Crèmes, curds et ganache' },
  { slug: 'pates-biscuits', nom: 'Pâtes et biscuits' },
  { slug: 'tartes-millefeuilles', nom: 'Tartes et millefeuilles' },
  { slug: 'entremets-gateaux-montes', nom: 'Entremets et gâteaux montés' },
  { slug: 'patisseries-individuelles', nom: 'Pâtisseries individuelles' },
  { slug: 'autres-gourmandises', nom: 'Autres gourmandises' },
]

const recettes = ref([])
const chargement = ref(true)
const erreur = ref(null)

const introContent = ref(null)
const introVisible = ref(false)
let observateur = null

onMounted(async () => {
  observateur = new IntersectionObserver(([entree]) => {
    if (entree.isIntersecting) {
      introVisible.value = true
      observateur.disconnect()
    }
  })
  observateur.observe(introContent.value)

  try {
    const reponse = await api.get('/recettes')
    recettes.value = reponse.data
  } catch (err) {
    console.error(err)
    erreur.value = 'Impossible de charger les recettes.'
  } finally {
    chargement.value = false
  }
})

onUnmounted(() => {
  observateur?.disconnect()
})
</script>

<template>
  <main>
    <section class="hero" aria-label="Présentation du site">
      <div class="hero-content">
        <h1>L'art de la pâtisserie <em>partagée.</em></h1>
        <p>
          Site collaboratif. <br />
          Créé par des passionnés, pour des passionnés.
        </p>
      </div>
    </section>

    <section class="intro" aria-label="Introduction au site">
      <div ref="introContent" class="intro-content" :class="{ visible: introVisible }">
        <h2>
          La pâtisserie française,<br />
          une tradition vivante.
        </h2>
        <p>
          Pâtissons réunit <em>passionnés et professionnels</em> autour du même art. <br />
          Ici, les recettes se transmettent, se partagent, s'enrichissent. <br />
          Toutes les recettes sont <em>testées et approuvées</em> par notre communauté, pour
          garantir des résultats délicieux à chaque bouchée.
        </p>
      </div>
    </section>

    <section class="categories" aria-label="Recherche par catégories">
      <h2>Recherche par catégories</h2>
      <ul class="categories__liste">
        <li v-for="categorie in categories" :key="categorie.slug">
          <RouterLink
            :to="{ path: '/recettes', query: { categorie: categorie.slug } }"
            class="categories__lien"
          >
            {{ categorie.nom }}
          </RouterLink>
        </li>
      </ul>
    </section>

    <section aria-label="Toutes les recettes">
      <h2 class="titre-resultats">Toutes les recettes</h2>

      <p v-if="chargement">Chargement en cours...</p>
      <p v-else-if="erreur">{{ erreur }}</p>

      <div v-else class="container">
        <RecetteCard
          v-for="recette in recettes"
          :key="recette.id_recette"
          :recette="recette"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero {
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.35) 0%, transparent 60%),
    url('/images/hero-patissons.jpg');
  background-size: cover;
  background-position: center;
  height: 600px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  color: #31190c;
  gap: 60px;
  padding-top: 80px;
}

.hero h1 {
  font-size: clamp(24px, 3.5vw, 40px);
  margin-bottom: 10px;
  font-style: italic;
  font-weight: 300;
}

.hero p {
  font-size: clamp(15px, 2vw, 25px);
  margin-bottom: 20px;
  color: beige;
}

.hero-content {
  padding: 20px 10px;
  letter-spacing: 1px;
  line-height: 1.6;
  font-size: 20px;
}

.intro {
  padding: 80px 40px;
  text-align: center;
  color: #31190c;
}

.intro-content {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.7s ease-out,
    transform 0.7s ease-out;
}

.intro-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.intro h2 {
  font-size: clamp(28px, 4.5vw, 50px);
  margin-bottom: 20px;
  font-style: italic;
  font-weight: 200;
  line-height: 1.25;
}

.intro p {
  font-size: clamp(16px, 2.5vw, 22px);
  max-width: 800px;
  margin: auto;
  color: #8a3d14;
}

.categories {
  padding: 80px 40px;
  background-color: #55250c;
  color: white;
  text-align: center;
}

.categories h2 {
  font-size: clamp(20px, 2.8vw, 30px);
  margin-bottom: 40px;
  font-style: italic;
}

.categories__liste {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.categories__lien {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  color: #7a2e10;
  text-decoration: none;
  font-size: clamp(13px, 1.4vw, 17px);
  padding: 10px 18px;
  border: 1px solid rgba(240, 213, 192, 0.4);
  border-radius: 30px;
  background: beige;
  transition: all 0.25s ease;
}

.categories__lien:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: #b84f32;
  color: #ffffff;
  transform: translateY(-2px);
}

.titre-resultats {
  font-size: clamp(24px, 3.5vw, 40px);
  margin-top: 40px;
  text-align: center;
  font-style: italic;
  font-weight: 200;
  line-height: 1.25;
}

.container {
  padding: 20px 40px 0 40px;
  margin: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 40px;
}

@media (max-width: 1170px) {
  .container {
    grid-template-columns: 1fr 1fr;
  }

  .intro,
  .categories {
    padding: 60px 30px;
  }
}

@media (max-width: 768px) {
  .hero {
    height: auto;
    padding: 60px 20px;
    gap: 30px;
  }

  .hero h1,
  .hero p {
    margin-bottom: 30px;
  }

  .container {
    grid-template-columns: 1fr;
    padding: 40px 20px;
  }

  .categories__liste {
    flex-direction: column;
    align-items: center;
  }

  .intro,
  .categories {
    padding: 40px 20px;
  }
}
</style>