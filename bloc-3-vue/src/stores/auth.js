import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const utilisateur = ref(JSON.parse(localStorage.getItem('utilisateur')))

  const estConnecte = computed(() => token.value !== null)

  async function connexion(email, motPasse) {
    const reponse = await api.post('/connexion', {
      email,
      mot_passe: motPasse,
    })

    token.value = reponse.data.token
    utilisateur.value = {
      id_utilisateur: reponse.data.id_utilisateur,
      nom: reponse.data.nom,
      role: reponse.data.role,
    }

    localStorage.setItem('token', token.value)
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur.value))
  }

  function deconnexion() {
    token.value = null
    utilisateur.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('utilisateur')
  }

  return { token, utilisateur, estConnecte, connexion, deconnexion }
})