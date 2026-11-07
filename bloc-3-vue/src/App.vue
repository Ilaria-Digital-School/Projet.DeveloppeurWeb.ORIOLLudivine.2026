<script setup>
import { ref , watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const router = useRouter()

function seDeconnecter() {
  auth.deconnexion()
  menuOuvert.value = false
  router.push('/')
}

const menuOuvert = ref(false)

// ACCESSIBILITÉ — Police OpenDyslexic
// On relit le choix enregistré (try/catch si le stockage est bloqué)
function lirePreferenceDys() {
  try {
    return localStorage.getItem('policeDys') === 'oui'
  } catch {
    return false
  }
}

const policeDys = ref(lirePreferenceDys())

// À chaque changement de policeDys : on met à jour <html> et on enregistre.
// immediate: true → s'exécute aussi au chargement de l'application.
watch(
  policeDys,
  (active) => {
    document.documentElement.classList.toggle('police-dys', active)
    try {
      localStorage.setItem('policeDys', active ? 'oui' : 'non')
    } catch {
      // stockage impossible : l'option reste active jusqu'au rechargement
    }
  },
  { immediate: true },
)
</script>

<template>
  <header class="header" role="banner">
    <RouterLink to="/">
      <img class="logo" src="/images/patissons-logo.svg" alt="Logo Pâtissons" />
    </RouterLink>

    <button class="burger" aria-label="Ouvrir le menu" :aria-expanded="menuOuvert" aria-controls="header-nav"
      @click="menuOuvert = !menuOuvert">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <nav id="header-nav" class="header-nav" :class="{ ouvert: menuOuvert }" aria-label="navigation principale">
      <RouterLink to="/recettes" @click="menuOuvert = false">Recettes</RouterLink>
      <RouterLink to="/ajouter-recette" @click="menuOuvert = false">Ajouter une recette</RouterLink>
      <RouterLink v-if="!auth.estConnecte" to="/connexion" @click="menuOuvert = false">
        Connexion
      </RouterLink>
      <button v-else type="button" class="lien-deconnexion" @click="seDeconnecter">
        Déconnexion
      </button>
      <RouterLink to="/favoris" @click="menuOuvert = false">Favoris</RouterLink>
      <button type="button" class="bouton-dys" :aria-pressed="policeDys" @click="policeDys = !policeDys">
        Police dyslexie
      </button>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
.header {
  background-color: var(--color-background);
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(93, 55, 28, 0.15);
  padding: 15px 30px;
}

.logo {
  height: 50px;
  transition: transform 0.4s ease-in-out;
}

.logo:hover {
  transform: scale(1.05);
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.burger span {
  display: block;
  width: 25px;
  height: 2px;
  background: #31190c;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.header-nav {
  display: flex;
  gap: 60px;
  font-size: clamp(14px, 1.8vw, 20px);
}

.header-nav a {
  text-decoration: none;
  color: #31190c;
}

.lien-deconnexion {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: #31190c;
  cursor: pointer;
  transition: color 0.2s ease;
}

.lien-deconnexion:hover,
.header-nav a:hover {
  color: #d85a30;
}

@media (max-width: 1170px) {
  .burger {
    display: flex;
  }

  .header-nav {
    display: none;
    flex-direction: column;
    gap: 20px;
    text-align: center;
    width: 100%;
    padding: 20px 0;
    border-top: 1px solid #e8d5c0;
  }

  .header-nav.ouvert {
    display: flex;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
}

.bouton-dys {
  background: none;
  border: 1px solid currentColor;
  border-radius: 4px;
  color: inherit;
  font: inherit;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
}

.bouton-dys:focus-visible {
  outline: 2px solid var(--color-brun-moyen);
  outline-offset: 2px;
}
</style>