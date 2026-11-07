// =============================================================
// VALIDATION DES FORMULAIRES (Cr 2.b.1, 2.b.2, 2.b.3)
// Script réutilisable : il s'applique à tout <form data-valider>.
// Les règles sont lues dans les attributs HTML de chaque champ :
//   required          → champ obligatoire
//   type="email"      → format d'adresse e-mail (expression régulière)
//   minlength="8"     → longueur minimale
//   data-confirmer="id" → doit être identique au champ portant cet id
// =============================================================

// Expression régulière pour l'e-mail :
// des caractères sans espace ni @, puis @, puis un domaine, un point
// et une extension d'au moins 2 lettres (ex. : nom@site.fr)
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Renvoie le message d'erreur d'un champ, ou "" s'il est valide
function messageErreur(champ) {
  const valeur = champ.value.trim();

  if (champ.required && valeur === "") {
    return "Ce champ est obligatoire.";
  }

  // Les règles suivantes ne s'appliquent que si le champ est rempli
  if (valeur === "") {
    return "";
  }

  if (champ.type === "email" && !REGEX_EMAIL.test(valeur)) {
    return "Adresse e-mail invalide (exemple : nom@site.fr).";
  }

  if (champ.minLength > 0 && valeur.length < champ.minLength) {
    return `Au moins ${champ.minLength} caractères (actuellement ${valeur.length}).`;
  }

  if (champ.dataset.confirmer) {
    const original = document.getElementById(champ.dataset.confirmer);
    if (original && champ.value !== original.value) {
      return "Les deux mots de passe ne sont pas identiques.";
    }
  }

  return "";
}

// Crée (une seule fois) la zone de message sous le champ
function zoneMessage(champ) {
  const id = `${champ.id}-erreur`;
  let zone = document.getElementById(id);

  if (!zone) {
    zone = document.createElement("p");
    zone.id = id;
    zone.className = "message-erreur";
    champ.insertAdjacentElement("afterend", zone);
    // Le lecteur d'écran lira le message quand le champ a le focus
    champ.setAttribute("aria-describedby", id);
  }
  return zone;
}

// Vérifie un champ et affiche (ou efface) son message. Renvoie true si valide.
function verifierChamp(champ) {
  const message = messageErreur(champ);
  const zone = zoneMessage(champ);

  // Le message est écrit en toutes lettres : l'erreur n'est pas
  // signalée uniquement par la couleur (Cr 1.c.3)
  zone.textContent = message ? `⚠ ${message}` : "";
  champ.setAttribute("aria-invalid", message ? "true" : "false");

  return message === "";
}

// Mise en place sur chaque formulaire concerné
document.querySelectorAll("form[data-valider]").forEach(function (formulaire) {
  const champs = formulaire.querySelectorAll("input, select, textarea");

  champs.forEach(function (champ) {
    // On ne crie pas à l'erreur dès la première lettre :
    // la vérification démarre quand l'utilisateur quitte le champ...
    champ.addEventListener("blur", function () {
      champ.dataset.touche = "oui";
      verifierChamp(champ);
    });

    // ...puis elle se fait en temps réel à chaque frappe
    champ.addEventListener("input", function () {
      if (champ.dataset.touche === "oui") {
        verifierChamp(champ);
      }
      // Si on modifie le mot de passe, on revérifie sa confirmation
      const confirmation = formulaire.querySelector(
        `[data-confirmer="${champ.id}"]`,
      );
      if (confirmation && confirmation.dataset.touche === "oui") {
        verifierChamp(confirmation);
      }
    });
  });

  // À l'envoi : on bloque si un seul champ est invalide (Cr 2.b.3)
  formulaire.addEventListener("submit", function (event) {
    event.preventDefault();

    let premierInvalide = null;
    champs.forEach(function (champ) {
      champ.dataset.touche = "oui";
      if (!verifierChamp(champ) && !premierInvalide) {
        premierInvalide = champ;
      }
    });

    if (premierInvalide) {
      // On amène l'utilisateur directement sur la première erreur
      premierInvalide.focus();
      return;
    }

    // Bloc 1 = site statique : pas de serveur pour recevoir les données.
    // L'envoi réel est fait dans le Bloc 3 (Vue + API Flask).
    afficherSucces(formulaire);
  });
});

// Message de confirmation, annoncé par les lecteurs d'écran (role="status")
function afficherSucces(formulaire) {
  let zone = formulaire.querySelector(".message-succes");
  if (!zone) {
    zone = document.createElement("p");
    zone.className = "message-succes";
    zone.setAttribute("role", "status");
    formulaire
      .querySelector('[type="submit"]')
      .insertAdjacentElement("beforebegin", zone);
  }
  zone.textContent =
    "✓ Formulaire valide. (Démonstration : l'envoi réel est assuré par la version Vue du site.)";
}
