import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { useAuthStore } from './auth'

export const useFavorisStore = defineStore('favoris', () => {
  const auth = useAuthStore()

  // Favoris renvoyés par l'API : [{ id_favori, date_ajout, id_recette, slug, titre, image }]
  const favoris = ref([])
  // Identifiant de l'utilisateur à qui appartiennent ces favoris
  const proprietaire = ref(null)

  // Les favoris de l'utilisateur actuellement connecté.
  // Si on s'est déconnecté puis reconnecté avec un autre compte,
  // on n'affiche jamais les favoris de l'ancien compte.
  const mesFavoris = computed(() =>
    proprietaire.value !== null && proprietaire.value === auth.utilisateur?.id_utilisateur
      ? favoris.value
      : [],
  )

  async function charger() {
    if (!auth.estConnecte || !auth.utilisateur) {
      favoris.value = []
      proprietaire.value = null
      return
    }
    const id = auth.utilisateur.id_utilisateur
    const reponse = await api.get(`/utilisateurs/${id}/favoris`)
    favoris.value = reponse.data
    proprietaire.value = id
  }

  // Renvoie le favori correspondant à une recette, ou null si elle n'est pas en favori
  function trouver(idRecette) {
    return mesFavoris.value.find((f) => f.id_recette === idRecette) ?? null
  }

  async function ajouter(idRecette) {
    await api.post('/favoris', { id_recette: idRecette })
    // On recharge la liste pour récupérer l'identifiant du nouveau favori
    await charger()
  }

  async function retirer(idFavori) {
    await api.delete(`/favoris/${idFavori}`)
    favoris.value = favoris.value.filter((f) => f.id_favori !== idFavori)
  }

  return { mesFavoris, charger, trouver, ajouter, retirer }
})