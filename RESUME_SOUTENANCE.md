# Pâtissons — Résumé du projet pour soutenance (Bloc 1)

> Document de synthèse destiné à être transmis à un assistant IA (Claude ou autre) pour générer le support PowerPoint de la soutenance devant le jury. Chaque section correspond à un bloc de contenu réutilisable pour une ou plusieurs diapositives.

---

## 1. Présentation du projet

- **Nom du projet :** Pâtissons
- **Concept :** site web collaboratif de recettes de pâtisserie — les utilisateurs consultent, filtrent, ajoutent des recettes et les mettent en favoris.
- **Bloc concerné :** Bloc 1 — Installer et configurer son environnement de développement (Développeur Web).
- **Stack technique actuelle :** site statique en HTML5 / CSS3 / JavaScript vanilla (aucun framework, aucun backend pour l'instant — Flask est prévu pour le Bloc 2).
- **Dépôts Git :** un dépôt personnel (GitHub `LudivineOriol/Block1Rncp`) et un dépôt école (Ilaria Digital School), synchronisés à chaque commit.
- **Outillage qualité :** Prettier (formatage de code automatique), `npm audit` (0 vulnérabilité détectée en juin 2026), veille technologique documentée (`VEILLE.md`).

---

## 2. Structure du projet

```
Bloc 1/
├── index.html                  → page d'accueil
├── templates/                  → toutes les autres pages HTML
│   ├── recettes.html               (liste + filtres des recettes)
│   ├── recette_detail.html         (détail d'une recette)
│   ├── ajouter_recette.html        (formulaire d'ajout)
│   ├── favoris.html                (recettes mises en favori)
│   ├── connexion.html / inscription.html / mot_de_passe_oublie.html
│   ├── contact.html
│   ├── mentions_legales.html
│   └── accessibilite.html          (déclaration d'accessibilité)
├── assets/
│   ├── css/style.css            → feuille de style unique du site
│   ├── js/                      → main.js, recettes.js, recette_detail.js, favoris.js
│   ├── images/                  → visuels des recettes + logo SVG
│   └── data/recettes.json       → base de données des recettes (JSON)
├── package.json / .prettierrc   → configuration des outils de dev
├── .gitignore
└── VEILLE.md                    → veille technologique (sécurité, outils)
```

**Logique d'architecture à présenter au jury :**
- Séparation claire structure (HTML) / présentation (CSS) / comportement (JS) / données (JSON).
- Les pages consomment dynamiquement `recettes.json` via JavaScript (`fetch`) pour générer les cartes de recettes et leurs attributs (image, titre, alt...) → pas de duplication de contenu en dur dans le HTML.
- Approche évolutive : la séparation données/affichage facilite le remplacement futur du JSON statique par une API Flask (Bloc 2) sans réécrire les pages.

---

## 3. Bonnes pratiques d'accessibilité (a11y)

Le site vise la conformité **WCAG 2.1 niveau AA**, avec une page dédiée (`accessibilite.html`) qui documente publiquement cet engagement, les mesures prises, les limites connues et les outils de test utilisés (Lighthouse, WAVE, axe DevTools).

| Pratique | Exemple concret dans le code |
|---|---|
| HTML sémantique | `<header role="banner">`, `<main role="main">`, `<footer role="contentinfo">` sur toutes les pages |
| Langue déclarée | `<html lang="fr">` sur chaque page |
| Navigation au clavier | menu burger accessible, focus visibles en CSS (`:focus { outline... }`) |
| ARIA sur les éléments interactifs | `aria-label="Ouvrir le menu"`, `aria-expanded="false"`, `aria-controls="header-nav"` sur le bouton burger |
| État dynamique annoncé | bouton favoris : `aria-label` qui bascule entre "Ajouter aux favoris" / "Retirer des favoris" |
| Fil d'ariane (breadcrumb) | `<nav aria-label="Fil d'ariane">` avec `aria-current="page"` sur toutes les pages internes |
| Formulaires accessibles | `<label for="...">` associé à chaque champ, `<fieldset>` + `<legend>` pour les groupes de filtres, astérisque obligatoire marqué `aria-hidden="true"` pour éviter une lecture redondante au lecteur d'écran |
| Textes alternatifs | `alt="Logo Pâtissons"` sur le logo, `alt` générés dynamiquement pour chaque image de recette (`alt="Photo de ${recette.titre}"`) |
| Hiérarchie des titres | un seul `<h1>` par page, sections en `<h2>` — structure logique pour les lecteurs d'écran |

**Limite assumée (transparence à présenter au jury) :** le site est en cours de développement et certaines fonctionnalités ne sont pas encore totalement validées (testées avec Lighthouse/WAVE/axe mais pas d'audit formalisé à ce stade) — c'est explicitement indiqué dans la page d'accessibilité elle-même.

---

## 4. Bonnes pratiques de référencement (SEO)

| Pratique | État sur Pâtissons |
|---|---|
| `<title>` unique par page | ✅ Chaque page a un titre descriptif (« Accueil Pâtissons », « Toutes les recettes - Pâtissons »...) |
| Meta description par page | ✅ Présente et pertinente sur chaque page (ex. « Pâtissons, le site collaboratif de recettes de pâtisseries... ») |
| `<meta charset>` + `<meta viewport>` | ✅ Présents sur toutes les pages (encodage correct + responsive mobile-first) |
| Attribut `lang` | ✅ `lang="fr"` partout, utile pour le ciblage linguistique des moteurs |
| Hiérarchie de titres H1/H2 | ✅ Respectée, renforce la compréhension du contenu par les moteurs |
| URLs descriptives | ✅ Paramètres lisibles (`?slug=cheesecake-citron-vert-vanille`, `?categorie=cremes-curds-ganache`) |
| Texte alternatif des images | ✅ Double bénéfice a11y + SEO (image indexable et contextualisée) |

**Axes d'amélioration à évoquer en soutenance (pour montrer l'esprit critique) :**
- Pas encore de balises **Open Graph / Twitter Card** (partage social optimisé) — amélioration prévue.
- Pas de **données structurées Schema.org `Recipe`** — pertinent pour un site de recettes, permettrait un affichage enrichi dans Google (temps de préparation, note, image).
- Pas de **sitemap.xml** ni de **robots.txt** — à ajouter pour un meilleur pilotage de l'indexation.

---

## 5. Sécurité et qualité (en complément, déjà couvert par la veille technologique)

- Variables sensibles jamais commitées (`.gitignore` + `.env` prévu pour Bloc 2/Flask).
- `node_modules/` exclu du dépôt.
- `npm audit` : 0 vulnérabilité (juin 2026).
- Formatage de code homogène via Prettier (évite les conflits Git liés au style).
- Veille structurée sur OWASP Top 10 et CVE, documentée dans `VEILLE.md`.
- Docker, utilisé initialement pour conteneuriser un serveur Nginx de démo, a été retiré du projet (choix final : Live Server / déploiement statique simple), avec mise à jour de la documentation de veille en conséquence.

---

## 6. Suggestion de plan pour les slides

1. Titre — Pâtissons, présentation du projet (Bloc 1)
2. Contexte & objectifs du projet
3. Stack technique & structure du projet (schéma de l'arborescence)
4. Accessibilité : démarche WCAG 2.1 AA + exemples concrets
5. Référencement (SEO) : bonnes pratiques en place
6. Sécurité & qualité de code (veille technologique, Prettier, npm audit)
7. Limites connues & pistes d'amélioration (Bloc 2 : Flask, sitemap, Schema.org...)
8. Conclusion & démonstration live
