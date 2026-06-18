# Veille technologique — Environnement de développement

**Projet :** Pâtissons — Site de recettes de pâtisserie  
**Bloc :** 1 — Installer et configurer son environnement de développement  
**Date :** Juin 2026

---

## 1. Sources consultées régulièrement

| Source                 | Type                                   | URL                             |
| ---------------------- | -------------------------------------- | ------------------------------- |
| Korben                 | Blog tech/sécurité francophone         | https://korben.info             |
| Reddit r/webdev        | Communauté développeurs web            | https://reddit.com/r/webdev     |
| Reddit r/javascript    | Actualités JavaScript                  | https://reddit.com/r/javascript |
| Reddit r/docker        | Actualités Docker                      | https://reddit.com/r/docker     |
| CVE Mitre              | Base de données officielle des failles | https://cve.mitre.org           |
| OWASP                  | Référence sécurité applications web    | https://owasp.org               |
| Documentation Docker   | Docs officielles Docker                | https://docs.docker.com         |
| Documentation Nginx    | Docs officielles Nginx                 | https://nginx.org/en/docs       |
| Documentation Prettier | Docs officielles Prettier              | https://prettier.io/docs        |

---

## 2. Bonnes pratiques de sécurité appliquées

### 2.1 Protection des variables d'environnement

Les variables sensibles (mots de passe, clés secrètes) ne doivent jamais être committées sur GitHub.

**Risque :** Un fichier `.env` poussé sur un dépôt public expose immédiatement les credentials à des robots qui scannent GitHub en permanence. Des bases de données entières ont été vidées de cette façon.

**Solution appliquée sur Pâtissons :**

- Fichier `.env` créé localement pour stocker les variables sensibles
- `.env` ajouté au `.gitignore` pour ne jamais être commité
- Utilisation de `python-dotenv` en Bloc 2 pour charger les variables dans Flask via `os.environ`

```
# .gitignore
.env
node_modules/
```

### 2.2 Exclusion de node_modules

Le dossier `node_modules` contient les dépendances du projet installées via npm. Il ne doit jamais être commité.

**Risques :**

- **Taille :** `node_modules` peut peser plusieurs centaines de Mo, inutile sur GitHub
- **Sécurité :** Les dépendances sont du code tiers — une faille dans une dépendance expose le projet
- **Reproductibilité :** Le fichier `package-lock.json` suffit pour réinstaller exactement les mêmes versions via `npm install`

**Solution appliquée :**

```
# .gitignore
node_modules/
```

**Vérification régulière des vulnérabilités :**

```bash
npm audit
```

Résultat sur Pâtissons : **0 vulnerabilities** (juin 2026)

### 2.3 Sécurité des images Docker

**Risque :** Utiliser une image Docker non officielle ou non maintenue peut introduire du code malveillant dans l'environnement de développement.

**Bonnes pratiques appliquées :**

- Utilisation de l'image officielle `nginx:alpine` depuis Docker Hub
- Choix de la variante **Alpine** : image minimaliste (~5MB) qui réduit la surface d'attaque (moins de packages installés = moins de failles potentielles)
- Utilisation d'un `.dockerignore` pour n'embarquer dans le conteneur que les fichiers strictement nécessaires

```
# .dockerignore
node_modules/
.git/
.prettierrc
.prettierignore
package.json
package-lock.json
docker-compose.yml
Dockerfile
```

### 2.4 Qualité du code avec Prettier

**Problématique :** Un code mal formaté et incohérent est difficile à relire, à maintenir et à déboguer. En équipe, chaque développeur ayant son propre style crée des conflits Git inutiles.

**Solution appliquée :**

- Installation de Prettier comme dépendance de développement : `npm install --save-dev prettier`
- Configuration dans `.prettierrc` avec des règles explicites et documentées
- Scripts npm pour formater ou vérifier le formatage :

```bash
npm run format        # corrige tous les fichiers
npm run format:check  # vérifie sans modifier (utile en CI/CD)
```

---

## 3. Vulnérabilités et évolutions à surveiller

### 3.1 Les 10 failles OWASP les plus courantes (Top 10)

L'OWASP (Open Web Application Security Project) publie régulièrement la liste des 10 failles web les plus répandues. Les plus pertinentes pour un projet front-end statique :

| Faille                                       | Description                                       | Impact sur Pâtissons                                             |
| -------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| **A05 - Mauvaise configuration de sécurité** | Serveur mal configuré, fichiers sensibles exposés | Risque si `.env` ou `node_modules` sont accessibles publiquement |
| **A06 - Composants vulnérables**             | Dépendances npm avec failles connues              | Surveillance via `npm audit`                                     |
| **A08 - Échecs d'intégrité**                 | Code ou dépendances non vérifiés                  | Utilisation d'images Docker officielles uniquement               |

### 3.2 CVE notables liés à l'environnement

Les CVE (Common Vulnerabilities and Exposures) sont des identifiants officiels attribués aux failles de sécurité connues. Exemples de failles liées à nos outils :

- **Nginx** : Des failles de type déni de service (DoS) sont régulièrement découvertes et corrigées. La mise à jour régulière de l'image Docker `nginx:alpine` permet de bénéficier des correctifs.
- **npm** : Des packages malveillants sont régulièrement détectés sur le registre npm (ex : typosquatting — des packages avec des noms très proches de packages populaires). Toujours vérifier l'origine d'un package avant de l'installer.

---

## 4. Outils de développement utilisés

| Outil                        | Version         | Rôle                                  |
| ---------------------------- | --------------- | ------------------------------------- |
| VS Code                      | Dernière stable | Éditeur de code principal             |
| Git                          | 2.x             | Gestion des versions                  |
| GitHub                       | —               | Hébergement du dépôt distant          |
| Docker Desktop               | Dernière stable | Gestion des conteneurs                |
| Nginx (Alpine)               | Dernière stable | Serveur web pour fichiers statiques   |
| Node.js / npm                | LTS             | Gestion des dépendances front-end     |
| Prettier                     | 3.x             | Contrôle qualité et formatage du code |
| Extension Docker (VS Code)   | —               | Coloration syntaxique Dockerfile      |
| Extension Prettier (VS Code) | —               | Formatage à la sauvegarde             |
| Live Server (VS Code)        | —               | Serveur de développement rapide       |

---

## 5. Conclusion

La mise en place d'un environnement de développement sécurisé et reproductible repose sur trois piliers :

1. **Ne jamais exposer de données sensibles** — variables d'environnement protégées par `.gitignore`
2. **Contrôler ce qu'on embarque** — `.dockerignore` et `node_modules` exclus du dépôt
3. **Vérifier régulièrement** — `npm audit` pour les dépendances, mise à jour des images Docker

Ces pratiques garantissent un environnement conforme à la production et limitent les risques de sécurité tout au long du développement.
