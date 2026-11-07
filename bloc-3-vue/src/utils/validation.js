// =============================================================
// Règles de validation des formulaires (réutilisables)
// Chaque fonction renvoie un message d'erreur, ou '' si c'est valide.
// Ce sont des fonctions « pures » : même entrée → même sortie,
// sans toucher à la page. Elles sont donc faciles à tester (Vitest).
// =============================================================

// Des caractères sans espace ni @, puis @, puis un domaine,
// un point et une extension d'au moins 2 lettres (ex. : nom@site.fr)
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

export function erreurObligatoire(valeur) {
  return valeur.trim() === '' ? 'Ce champ est obligatoire.' : ''
}

export function erreurEmail(valeur) {
  if (valeur.trim() === '') return 'Ce champ est obligatoire.'
  return REGEX_EMAIL.test(valeur.trim()) ? '' : 'Adresse e-mail invalide (exemple : nom@site.fr).'
}

export function erreurLongueur(valeur, minimum) {
  if (valeur === '') return 'Ce champ est obligatoire.'
  return valeur.length < minimum
    ? `Au moins ${minimum} caractères (actuellement ${valeur.length}).`
    : ''
}

export function erreurConfirmation(valeur, original) {
  if (valeur === '') return 'Ce champ est obligatoire.'
  return valeur !== original ? 'Les deux mots de passe ne sont pas identiques.' : ''
}