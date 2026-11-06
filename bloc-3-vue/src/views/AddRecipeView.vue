<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// Cette page sert à ajouter ET à modifier une recette :
// la route /recettes/:id/modifier fournit un id, /ajouter-recette n'en fournit pas.
const idRecette = computed(() => route.params.id ?? null)
const modeModification = computed(() => idRecette.value !== null)

// Identifiants issus de la table Categorie
const categories = [
  { id: 1, label: 'Entremets et gâteaux montés' },
  { id: 2, label: 'Pâtes et biscuits' },
  { id: 3, label: 'Crèmes, curds et ganache' },
  { id: 19, label: 'Pâtisseries individuelles' },
]

// Champs simples du formulaire
const titre = ref('')
const idCategorie = ref('')
const description = ref('')
const tempsPreparation = ref(null)
const tempsCuisson = ref(null)
const portions = ref(null)
const difficulte = ref('')
const image = ref('')

// En modification, on garde le slug d'origine (identifiant de la recette)
const slugConserve = ref('')

// États de la page
const chargement = ref(false)
const erreurChargement = ref(null)
const envoiEnCours = ref(false)
const erreur = ref(null)

const libelleBouton = computed(() => {
  if (envoiEnCours.value) return 'Envoi en cours…'
  return modeModification.value ? 'Enregistrer les modifications' : 'Publier la recette'
})

// Ingrédients : une liste de groupes (ex. "Pâte", "Crème"),
// chaque groupe a sa propre liste d'ingrédients
const groupes = ref([{ nom: '', items: [{ nom: '', quantite: null, unite: '' }] }])

function ajouterGroupe() {
  groupes.value.push({ nom: '', items: [{ nom: '', quantite: null, unite: '' }] })
}

function supprimerGroupe(index) {
  groupes.value.splice(index, 1)
}

function ajouterIngredient(groupe) {
  groupe.items.push({ nom: '', quantite: null, unite: '' })
}

function supprimerIngredient(groupe, index) {
  groupe.items.splice(index, 1)
}

// Étapes de préparation
const etapes = ref([{ titre: '', description: '' }])

function ajouterEtape() {
  etapes.value.push({ titre: '', description: '' })
}

function supprimerEtape(index) {
  etapes.value.splice(index, 1)
}

// "Tarte au citron" devient "tarte-au-citron" (sans accents, sans majuscules)
function creerSlug(texte) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Remet le formulaire à zéro (utile quand on passe de "modifier" à "ajouter")
function reinitialiserFormulaire() {
  titre.value = ''
  idCategorie.value = ''
  description.value = ''
  tempsPreparation.value = null
  tempsCuisson.value = null
  portions.value = null
  difficulte.value = ''
  image.value = ''
  slugConserve.value = ''
  groupes.value = [{ nom: '', items: [{ nom: '', quantite: null, unite: '' }] }]
  etapes.value = [{ titre: '', description: '' }]
  erreur.value = null
  erreurChargement.value = null
}

// En modification : on récupère la recette et on remplit le formulaire avec ses données
async function chargerRecette(id) {
  chargement.value = true
  try {
    const reponse = await api.get(`/recettes/${id}`)
    const r = reponse.data

    // Seul l'auteur ou un administrateur peut modifier (l'API le vérifie aussi)
    const estAuteur = auth.utilisateur?.id_utilisateur === r.id_utilisateur
    const estAdmin = auth.utilisateur?.role === 'administrateur'
    if (!estAuteur && !estAdmin) {
      erreurChargement.value = 'Vous ne pouvez modifier que vos propres recettes.'
      return
    }

    slugConserve.value = r.slug
    titre.value = r.titre
    idCategorie.value = r.id_categorie
    description.value = r.description ?? ''
    tempsPreparation.value = r.temps_preparation
    tempsCuisson.value = r.temps_cuisson || null
    portions.value = r.portions
    difficulte.value = r.difficulte
    image.value = r.image ?? ''

    if (r.ingredients.length) {
      groupes.value = r.ingredients.map((g) => ({
        nom: g.nom_groupe,
        items: g.ingredients.length
          ? g.ingredients.map((i) => ({
              nom: i.nom,
              quantite: i.quantite === null ? null : Number(i.quantite),
              unite: i.unite ?? '',
            }))
          : [{ nom: '', quantite: null, unite: '' }],
      }))
    }

    if (r.etapes.length) {
      etapes.value = [...r.etapes]
        .sort((a, b) => a.ordre - b.ordre)
        .map((e) => ({ titre: e.titre, description: e.description }))
    }
  } catch (err) {
    console.error(err)
    erreurChargement.value = 'Impossible de charger cette recette.'
  } finally {
    chargement.value = false
  }
}

// Construit le contenu envoyé à l'API (même format pour l'ajout et la modification)
function construirePayload(slug) {
  return {
    slug,
    titre: titre.value,
    description: description.value,
    temps_preparation: tempsPreparation.value,
    temps_cuisson: tempsCuisson.value || null,
    portions: portions.value,
    difficulte: difficulte.value,
    id_categorie: idCategorie.value,
    image: image.value.trim() || null,
    // On ignore les lignes laissées vides
    ingredients: groupes.value
      .filter((g) => g.items.some((i) => i.nom.trim() !== ''))
      .map((g) => ({
        groupe: g.nom.trim() || 'Ingrédients',
        items: g.items
          .filter((i) => i.nom.trim() !== '')
          .map((i) => ({
            nom: i.nom.trim(),
            quantite: i.quantite,
            unite: i.unite.trim() || null,
          })),
      })),
    etapes: etapes.value
      .filter((e) => e.description.trim() !== '')
      .map((e, index) => ({
        numero: index + 1,
        titre: e.titre.trim() || `Étape ${index + 1}`,
        description: e.description.trim(),
      })),
  }
}

async function envoyer() {
  erreur.value = null
  envoiEnCours.value = true
  try {
    if (modeModification.value) {
      await api.put(`/recettes/${idRecette.value}`, construirePayload(slugConserve.value))
      router.push(`/recettes/${idRecette.value}`)
    } else {
      const reponse = await api.post('/recettes', construirePayload(creerSlug(titre.value)))
      router.push(`/recettes/${reponse.data.id_recette}`)
    }
  } catch (err) {
    console.error(err)
    erreur.value =
      err.response?.data?.erreur ?? "Impossible d'enregistrer la recette. Veuillez réessayer."
  } finally {
    envoiEnCours.value = false
  }
}

// À chaque changement de page (ajouter <-> modifier) : on remet à zéro,
// puis on charge la recette si on est en modification.
// Ce bloc doit rester en dernier : il utilise tout ce qui est déclaré au-dessus.
watch(
  idRecette,
  (id) => {
    reinitialiserFormulaire()
    if (id !== null) chargerRecette(id)
  },
  { immediate: true },
)
</script>


<template>
  <main>
    <section class="ajouter-recette" aria-label="Formulaire pour ajouter une nouvelle recette">
      <h1>{{ modeModification ? 'Modifier la recette' : 'Ajouter une nouvelle recette' }}</h1>

      <p v-if="chargement" class="message-chargement">Chargement de la recette…</p>
      <p v-else-if="erreurChargement" role="alert" class="message-erreur">
        {{ erreurChargement }}
      </p>

      <form v-else class="ajouter-recette-form" @submit.prevent="envoyer">
        <!-- INFORMATIONS GÉNÉRALES -->
        <fieldset>
          <legend>Informations générales</legend>

          <div class="form-group">
            <label for="titre">Titre de la recette <span aria-hidden="true">*</span></label>
            <input
              id="titre"
              v-model="titre"
              type="text"
              placeholder="Ex : Tarte au citron meringuée"
              required
            />
          </div>

          <div class="form-group">
            <label for="categorie">Catégorie <span aria-hidden="true">*</span></label>
            <select id="categorie" v-model="idCategorie" required>
              <option value="">Choisir une catégorie</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.label }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              placeholder="Décrivez votre recette en quelques mots…"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="image">Image (chemin ou lien)</label>
            <input
              id="image"
              v-model="image"
              type="text"
              placeholder="Ex : /images/pavlova.jpg ou https://…"
            />
            <span class="form-aide">
              Facultatif. Collez le lien d'une image, ou le chemin d'un fichier du dossier images.
            </span>
          </div>
        </fieldset>

        <!-- TEMPS ET DIFFICULTÉ -->
        <fieldset>
          <legend>Temps et difficulté</legend>

          <div class="form-row">
            <div class="form-group">
              <label for="temps-preparation">
                Préparation (min) <span aria-hidden="true">*</span>
              </label>
              <input
                id="temps-preparation"
                v-model="tempsPreparation"
                type="number"
                min="1"
                max="999"
                required
              />
            </div>

            <div class="form-group">
              <label for="temps-cuisson">Cuisson (min)</label>
              <input id="temps-cuisson" v-model="tempsCuisson" type="number" min="0" max="999" />
            </div>

            <div class="form-group">
              <label for="portions">Portions <span aria-hidden="true">*</span></label>
              <input id="portions" v-model="portions" type="number" min="1" max="99" required />
            </div>
          </div>

          <div class="form-group">
            <label>Difficulté <span aria-hidden="true">*</span></label>
            <div class="radio-groupe">
              <label class="radio-ligne">
                <input
                  v-model="difficulte"
                  type="radio"
                  name="difficulte"
                  value="Facile"
                  required
                />
                Facile
              </label>
              <label class="radio-ligne">
                <input v-model="difficulte" type="radio" name="difficulte" value="Intermédiaire" />
                Intermédiaire
              </label>
              <label class="radio-ligne">
                <input v-model="difficulte" type="radio" name="difficulte" value="Difficile" />
                Difficile
              </label>
            </div>
          </div>
        </fieldset>

        <!-- INGRÉDIENTS -->
        <fieldset>
          <legend>Ingrédients</legend>

          <div v-for="(groupe, gi) in groupes" :key="gi" class="groupe-ingredients">
            <div class="form-group">
              <label :for="`groupe-${gi}`">Nom du groupe</label>
              <input
                :id="`groupe-${gi}`"
                v-model="groupe.nom"
                type="text"
                placeholder="Ex : Pâte, Crème, Glaçage…"
              />
            </div>

            <div v-for="(item, ii) in groupe.items" :key="ii" class="form-row ligne-ingredient">
              <div class="form-group">
                <label :for="`ing-nom-${gi}-${ii}`">Ingrédient</label>
                <input
                  :id="`ing-nom-${gi}-${ii}`"
                  v-model="item.nom"
                  type="text"
                  placeholder="Ex : farine"
                />
              </div>
              <div class="form-group">
                <label :for="`ing-qte-${gi}-${ii}`">Quantité</label>
                <input
                  :id="`ing-qte-${gi}-${ii}`"
                  v-model="item.quantite"
                  type="number"
                  min="0"
                  step="any"
                />
              </div>
              <div class="form-group">
                <label :for="`ing-unite-${gi}-${ii}`">Unité</label>
                <input
                  :id="`ing-unite-${gi}-${ii}`"
                  v-model="item.unite"
                  type="text"
                  placeholder="Ex : g, ml"
                />
              </div>
              <button
                type="button"
                class="btn-retirer"
                :disabled="groupe.items.length === 1"
                @click="supprimerIngredient(groupe, ii)"
              >
                Supprimer
              </button>
            </div>

            <div class="actions-groupe">
              <button type="button" class="btn-ajouter" @click="ajouterIngredient(groupe)">
                Ajouter un ingrédient
              </button>
              <button
                v-if="groupes.length > 1"
                type="button"
                class="btn-retirer"
                @click="supprimerGroupe(gi)"
              >
                Supprimer ce groupe
              </button>
            </div>
          </div>

          <button type="button" class="btn-ajouter" @click="ajouterGroupe">
            Ajouter un groupe d'ingrédients
          </button>
        </fieldset>

        <!-- ÉTAPES -->
        <fieldset>
          <legend>Étapes de préparation</legend>

          <div v-for="(etape, index) in etapes" :key="index" class="etape-bloc">
            <div class="etape-entete">
              <span class="etape-numero" aria-hidden="true">{{ index + 1 }}</span>
              <p class="etape-libelle">Étape {{ index + 1 }}</p>
              <button
                type="button"
                class="btn-retirer"
                :disabled="etapes.length === 1"
                @click="supprimerEtape(index)"
              >
                Supprimer cette étape
              </button>
            </div>

            <div class="form-group">
              <label :for="`etape-titre-${index}`">Titre</label>
              <input
                :id="`etape-titre-${index}`"
                v-model="etape.titre"
                type="text"
                placeholder="Ex : Monter les blancs"
              />
            </div>
            <div class="form-group">
              <label :for="`etape-desc-${index}`">Description</label>
              <textarea
                :id="`etape-desc-${index}`"
                v-model="etape.description"
                rows="3"
              ></textarea>
            </div>
          </div>

          <button type="button" class="btn-ajouter" @click="ajouterEtape">Ajouter une étape</button>
        </fieldset>

        <p v-if="erreur" role="alert" class="message-erreur">{{ erreur }}</p>

        <p class="form-obligatoire"><span aria-hidden="true">*</span> Champs obligatoires</p>

        <button type="submit" class="btn-publier" :disabled="envoiEnCours">
          {{ libelleBouton }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
/* ===== PAGE ===== */
.ajouter-recette {
  max-width: 820px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.ajouter-recette h1 {
  font-size: clamp(28px, 4vw, 50px);
  font-style: italic;
  font-weight: 300;
  color: #31190c;
  text-align: center;
  margin-bottom: 30px;
}

.ajouter-recette-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ===== CARTES (fieldset) ===== */
.ajouter-recette-form fieldset {
  background: #fdfaf6;
  border: 1px solid #e8d5c0;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 0;
  min-width: 0;
}

.ajouter-recette-form legend {
  float: left;
  width: 100%;
  padding: 0 0 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8d5c0;
  font-size: clamp(20px, 2.5vw, 28px);
  font-style: italic;
  font-weight: 300;
  color: #31190c;
}

.ajouter-recette-form legend + * {
  clear: both;
}

/* ===== CHAMPS ===== */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group > label {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #31190c;
}

.form-group input[type='text'],
.form-group input[type='number'],
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #e8d5c0;
  border-radius: 8px;
  background: #ffffff;
  font: inherit;
  font-size: 17px;
  color: #31190c;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group textarea {
  resize: vertical;
  min-height: 90px;
}

.form-group ::placeholder {
  color: #b07a4a;
  opacity: 0.7;
}

.form-group input:focus-visible,
.form-group select:focus-visible,
.form-group textarea:focus-visible {
  outline: none;
  border-color: #b84f32;
  box-shadow: 0 0 0 3px rgba(184, 79, 50, 0.2);
}

.form-aide {
  font-size: 15px;
  font-style: italic;
  color: #8a3d14;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  margin-bottom: 0;
}

/* ===== DIFFICULTÉ (boutons à choix) ===== */
.radio-groupe {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.radio-ligne {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  border: 1px solid #e8d5c0;
  border-radius: 999px;
  background: #ffffff;
  color: #563417;
  font-size: 17px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.radio-ligne input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.radio-ligne:hover {
  border-color: #b07a4a;
}

.radio-ligne:has(input:checked) {
  background: #b84f32;
  border-color: #b84f32;
  color: #fdfaf6;
}

.radio-ligne:has(input:focus-visible) {
  box-shadow: 0 0 0 3px rgba(184, 79, 50, 0.3);
}

/* ===== INGRÉDIENTS ===== */
.groupe-ingredients {
  background: #f3eade;
  border: 1px solid #e8d5c0;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 16px;
}

.ligne-ingredient {
  grid-template-columns: 2fr 1fr 1fr auto;
  align-items: end;
  margin-bottom: 12px;
}

.actions-groupe {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

/* ===== ÉTAPES ===== */
.etape-bloc {
  background: #f3eade;
  border: 1px solid #e8d5c0;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 16px;
}

.etape-entete {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.etape-numero {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #b84f32;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}

.etape-libelle {
  flex: 1;
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: #31190c;
}

/* ===== BOUTONS ===== */
.btn-ajouter,
.btn-retirer,
.btn-publier {
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ajouter {
  padding: 9px 18px;
  background: transparent;
  border: 1px solid #e38010;
  border-radius: 8px;
  color: #563417;
  font-size: 18px;
  font-weight: 600;
}

.btn-ajouter:hover {
  background: #e8d5c0;
  color: #31190c;
}

.btn-retirer {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #b84f32;
  font-size: 16px;
}

.btn-retirer:hover:not(:disabled) {
  border-color: #b84f32;
}

.btn-publier {
  align-self: center;
  padding: 12px 40px;
  background: #b84f32;
  border: 1px solid #b84f32;
  border-radius: 8px;
  color: #fdfaf6;
  font-size: 20px;
  font-weight: 600;
}

.btn-publier:hover:not(:disabled) {
  background: #9c3f26;
  border-color: #9c3f26;
}

.btn-retirer:disabled,
.btn-publier:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ajouter:focus-visible,
.btn-retirer:focus-visible,
.btn-publier:focus-visible {
  outline: 3px solid rgba(184, 79, 50, 0.35);
  outline-offset: 2px;
}

/* ===== MESSAGES ===== */
.message-erreur {
  margin: 0;
  padding: 12px 16px;
  background: #fdfaf6;
  border-left: 3px solid #b84f32;
  border-radius: 4px;
  color: #8a3d14;
  font-style: italic;
}

.form-obligatoire {
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-style: italic;
  color: #8a3d14;
}

.message-chargement {
  text-align: center;
  font-style: italic;
  color: #8a3d14;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .ajouter-recette {
    padding: 24px 15px 40px;
  }

  .ajouter-recette-form fieldset {
    padding: 1rem;
  }

  .ligne-ingredient {
    grid-template-columns: 1fr 1fr;
  }

  .ligne-ingredient .form-group:first-child {
    grid-column: 1 / -1;
  }

  .ligne-ingredient .btn-retirer {
    grid-column: 1 / -1;
    justify-self: end;
  }
}
</style>