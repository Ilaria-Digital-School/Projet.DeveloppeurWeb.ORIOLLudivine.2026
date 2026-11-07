<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import {
  erreurObligatoire,
  erreurEmail,
  erreurLongueur,
  erreurConfirmation,
} from '../utils/validation'

const router = useRouter()

const nom = ref('')
const email = ref('')
const motPasse = ref('')
const confirmation = ref('')
const erreur = ref(null) // erreur renvoyée par l'API
const envoiEnCours = ref(false)

// Un champ est « touché » quand l'utilisateur l'a quitté une première fois :
// on n'affiche pas d'erreur avant, pour ne pas le gêner pendant qu'il tape.
const touche = reactive({ nom: false, email: false, motPasse: false, confirmation: false })

// computed : recalculé automatiquement à chaque frappe (réactivité de Vue)
const erreurs = computed(() => ({
  nom: erreurObligatoire(nom.value),
  email: erreurEmail(email.value),
  motPasse: erreurLongueur(motPasse.value, 8),
  confirmation: erreurConfirmation(confirmation.value, motPasse.value),
}))

const formulaireValide = computed(() =>
  Object.values(erreurs.value).every((message) => message === ''),
)

// Message à afficher sous un champ (vide tant qu'il n'est pas touché)
function message(champ) {
  return touche[champ] ? erreurs.value[champ] : ''
}

// Correspondance entre le nom du champ et l'id de son <input>
const idsChamps = { nom: 'nom', email: 'email', motPasse: 'password', confirmation: 'confirmation' }

async function sInscrire() {
  erreur.value = null

  // À l'envoi, on affiche toutes les erreurs d'un coup
  Object.keys(touche).forEach((champ) => (touche[champ] = true))

  if (!formulaireValide.value) {
    // On place le curseur sur le premier champ invalide
    const premier = Object.keys(erreurs.value).find((champ) => erreurs.value[champ] !== '')
    document.getElementById(idsChamps[premier])?.focus()
    return // rien n'est envoyé à l'API (Cr 2.b.3)
  }

  envoiEnCours.value = true
  try {
    await api.post('/inscription', {
      nom: nom.value.trim(),
      email: email.value.trim(),
      mot_passe: motPasse.value,
    })
    // Compte créé (réponse 201) : on envoie la personne se connecter
    router.push('/connexion')
  } catch (err) {
    console.error(err)
    erreur.value = err.response?.data?.erreur ?? 'Inscription impossible pour le moment.'
  } finally {
    envoiEnCours.value = false
  }
}
</script>

<template>
  <main>
    <nav aria-label="Fil d'ariane" class="fil-ariane">
      <ol>
        <li><RouterLink to="/">Accueil</RouterLink></li>
        <li aria-current="page">Inscription</li>
      </ol>
    </nav>

    <section class="connexion-section" aria-label="Formulaire d'inscription">
      <h1>Créer votre compte</h1>

      <form class="connexion-form" novalidate @submit.prevent="sInscrire">
        <div class="form-group">
          <label for="nom">Nom</label>
          <input
            id="nom"
            v-model="nom"
            type="text"
            placeholder="Entrez votre nom"
            autocomplete="name"
            required
            :aria-invalid="message('nom') ? 'true' : 'false'"
            aria-describedby="nom-erreur"
            @blur="touche.nom = true"
          />
          <p id="nom-erreur" class="message-erreur">
            {{ message('nom') ? '⚠ ' + message('nom') : '' }}
          </p>
        </div>

        <div class="form-group">
          <label for="email">Adresse e-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Entrez votre adresse e-mail"
            autocomplete="email"
            required
            :aria-invalid="message('email') ? 'true' : 'false'"
            aria-describedby="email-erreur"
            @blur="touche.email = true"
          />
          <p id="email-erreur" class="message-erreur">
            {{ message('email') ? '⚠ ' + message('email') : '' }}
          </p>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="motPasse"
            type="password"
            placeholder="Choisissez un mot de passe (8 caractères minimum)"
            autocomplete="new-password"
            minlength="8"
            required
            :aria-invalid="message('motPasse') ? 'true' : 'false'"
            aria-describedby="password-erreur"
            @blur="touche.motPasse = true"
          />
          <p id="password-erreur" class="message-erreur">
            {{ message('motPasse') ? '⚠ ' + message('motPasse') : '' }}
          </p>
        </div>

        <div class="form-group">
          <label for="confirmation">Confirmer le mot de passe</label>
          <input
            id="confirmation"
            v-model="confirmation"
            type="password"
            placeholder="Retapez votre mot de passe"
            autocomplete="new-password"
            required
            :aria-invalid="message('confirmation') ? 'true' : 'false'"
            aria-describedby="confirmation-erreur"
            @blur="touche.confirmation = true"
          />
          <p id="confirmation-erreur" class="message-erreur">
            {{ message('confirmation') ? '⚠ ' + message('confirmation') : '' }}
          </p>
        </div>

        <p v-if="erreur" class="erreur-connexion" role="alert">{{ erreur }}</p>

        <button type="submit" :disabled="envoiEnCours">
          {{ envoiEnCours ? 'Inscription en cours...' : "S'inscrire" }}
        </button>

        <p class="auth-lien-discret">
          Déjà un compte ? <RouterLink to="/connexion">Connectez-vous</RouterLink>
        </p>
      </form>
    </section>
  </main>
</template>

<style scoped>
.fil-ariane ol {
  list-style: none;
  display: flex;
  gap: 8px;
  max-width: 480px;
  margin: 24px auto 0;
  padding: 0 20px;
  font-size: 14px;
  color: #b07a4a;
}

.fil-ariane a {
  color: #b07a4a;
  text-decoration: none;
}

.fil-ariane a:hover {
  text-decoration: underline;
}

.fil-ariane li + li::before {
  content: '/';
  margin-right: 8px;
}

.connexion-section {
  max-width: 480px;
  margin: 24px auto 60px;
  padding: 0 20px;
}

.connexion-section h1 {
  font-size: clamp(28px, 4vw, 42px);
  font-style: italic;
  font-weight: 300;
  color: #31190c;
  text-align: center;
  margin-bottom: 8px;
}

.connexion-form {
  background: #fdfaf6;
  border: 1px solid #e8d5c0;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.connexion-form label {
  font-family: 'Georgia', serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #31190c;
  display: block;
  margin-bottom: 4px;
}

.connexion-form input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #e8d5c0;
  border-radius: 8px;
  background: white;
  font-family: 'Georgia', serif;
  font-size: 15px;
  color: #31190c;
  transition: border-color 0.2s ease;
}

.connexion-form input:focus {
  border-color: #b07a4a;
  outline: none;
}

.connexion-form input::placeholder {
  color: #905624;
  opacity: 0.5;
  font-style: italic;
}

.connexion-form button[type='submit'] {
  width: 100%;
  padding: 12px;
  background: #b84f32;
  color: white;
  border: none;
  border-radius: 30px;
  font-family: 'Georgia', serif;
  font-size: 17px;
  font-style: italic;
  font-weight: 300;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 8px;
}

.connexion-form button[type='submit']:hover:not(:disabled) {
  background: #e0700e;
}

.connexion-form button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-lien-discret {
  text-align: center;
  font-size: 13px;
  color: #6e3707;
  font-style: normal;
  text-decoration: none;
  display: block;
}

.auth-lien-discret a {
  color: #b84f32;
  text-decoration: none;
}

.auth-lien-discret a:hover {
  text-decoration: underline;
}

.erreur-connexion {
  font-size: 13px;
  color: #b84f32;
  text-align: center;
  margin: 0;
}
/* Validation : contraste #9b1c13 sur #fdfaf6 = 7,86:1 (WCAG AA ≥ 4,5:1) */
.message-erreur {
  color: #9b1c13;
  font-size: 13px;
  margin: 4px 0 0;
  min-height: 1.2em; /* évite que le formulaire « saute » */
}

.connexion-form input[aria-invalid='true'] {
  border: 2px solid #9b1c13;
}
</style>
