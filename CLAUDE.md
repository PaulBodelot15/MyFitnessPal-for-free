# MyFitnessPal for Free — Contexte projet pour Claude Code

## Objectif du projet

Paul (non-tech, débutant en dev) reprend une prise de masse (PDM) sérieuse en musculation à partir de septembre. Il veut remplacer l'abonnement payant MyFitnessPal par une appli maison de tracking nutritionnel, pour peser ses aliments et suivre ses macros/poids sans payer.

**Important sur la posture attendue de Claude Code** : Paul a explicitement demandé d'être traité comme sur un projet géré par un chef de projet dev — anticiper les problèmes, poser les bonnes questions à chaque étape, recadrer si une direction n'est pas réaliste, proposer des contournements. Il veut comprendre ce qui est fait, pas juste recevoir un résultat en boîte noire.

## Stack technique retenue

- **Frontend** : React + Vite (choisi pour légèreté et adéquation PWA) — code dans `app/`
- **Backend/DB** : Supabase (projet `wedpdddxbeoqmnbanadc`, région eu-west-2). Clés dans `app/.env.local` (gitignored, jamais commité)
- **Déploiement cible** : Vercel (décidé avec Paul)
- **Environnement de dev** : Claude Code

## Supabase — déjà en place côté Paul

Un projet Supabase existe déjà avec le schéma de base de données complet et fonctionnel. Demander à Paul l'URL du projet et les clés API au moment de connecter le code dessus.

### Schéma de base de données (déjà créé, RLS actif)

**`user_goals`** — objectifs macro par utilisateur, évolutifs dans le temps
- `id`, `user_id` (FK auth.users), `date_debut`, `poids_depart`, `poids_cible`, `tdee_estime`, `kcal_cible`, `proteines_g`, `lipides_g`, `glucides_g`, `created_at`

**`body_weight_log`** — suivi du poids corporel
- `id`, `user_id`, `date`, `poids_kg`, `note`, `created_at`

**`food_log`** — journal alimentaire quotidien
- `id`, `user_id`, `date`, `nom_aliment`, `source` (check: 'ciqual' ou 'openfoodfacts'), `poids_g`, `kcal`, `proteines_g`, `lipides_g`, `glucides_g`, `created_at`

**`ciqual_foods`** — base de référence nutritionnelle française (importée : **3341 aliments**, total propre)
- `id`, `code_ciqual` (unique), `nom_aliment`, `kcal_100g`, `proteines_100g`, `lipides_100g`, `glucides_100g`, `fibres_100g`, `sel_100g`, `created_at`

### Policies RLS actives

- `user_goals`, `body_weight_log`, `food_log` : accès strict par utilisateur (`auth.uid() = user_id`) en SELECT/INSERT/UPDATE/DELETE
- `ciqual_foods` : lecture publique (`SELECT USING (true)`), pas de policy d'écriture publique (table de référence, pas de données perso)

### Authentification

Supabase Auth email/mot de passe activé par défaut. Pas encore de code front-end fonctionnel dessus — à construire.

## Sources de données alimentaires

1. **CIQUAL (Anses)** ✅ importé et corrigé — 3341/3341 lignes du fichier source, toutes valides. Couvre bien les aliments bruts/génériques français (viandes, légumes, féculents...).
   - ⚠️ **Historique d'un bug corrigé** : un premier import n'avait chargé que 2841 lignes. La cause réelle n'était **pas** des doublons de `code_ciqual` (il n'y en a aucun dans le fichier source), mais un échec silencieux sur les notations texte utilisées par CIQUAL pour les valeurs infimes (`< 0,5`, `traces`) et les décimales en virgule française, non gérées par l'import initial. Ce bug supprimait en priorité les aliments bruts (fruits/légumes crus ont souvent des lipides "< 0,5"), biaisant mécaniquement la base restante vers les plats préparés. Réimport complet effectué le 2026-08-19 avec parsing corrigé (virgule → point, valeurs trace → 0, lignes sans kcal exclues). Script/valeurs générés à la volée, pas conservés en repo — si un nouvel import est nécessaire, repartir du fichier source `Jeux de données/Table Ciqual 2025_FR_2025_11_03.xlsx` avec la même logique de nettoyage.
2. **Open Food Facts** ✅ intégré (recherche combinée avec CIQUAL dans `app/src/lib/foodSearch.js`, endpoint `api/v2/search`). API REST publique, pas de clé requise. Leur infrastructure publique renvoie des `503` de façon intermittente — l'app gère déjà la dégradation (CIQUAL continue de fonctionner seul, message d'avertissement à l'utilisateur).
3. **USDA FoodData Central** — reporté en V2, pour compléments alimentaires/produits sportifs US.

## Fonctionnalités V1 (validées avec Paul, ne pas dévier sans son accord)

1. Recherche d'un aliment (CIQUAL + Open Food Facts) → poids pesé en entrée → macros calculées automatiquement
2. Totaux macros/kcal du jour
3. Objectifs macros calculés selon poids/objectif de PDM (voir chiffres ci-dessous)
4. Suivi du poids corporel avec courbe
5. Historique des jours passés consultable

**Explicitement exclu de la V1** : scan code-barre, recettes/plats composés, appli installable native (App Store). Format cible : PWA mobile-friendly, pas d'app store.

## Données physiologiques de Paul (pour les calculs macro)

- Poids de référence : 72,3 kg (mesuré par impédancemétrie Boditrax)
- BMR mesuré (pas calculé par formule) : 1915 kcal
- Masse grasse : 7 kg (~9,7%)
- Objectif de poids : 70 → 82 kg (fourchette large, durée de PDM à déterminer selon les retours réels)
- Niveau d'activité : très actif (tennis x2/semaine, running x3/semaine, ~20k pas/jour en moyenne)
- **TDEE estimé** (fourchette 3300-3640 selon formules, point médian retenu) : ~3450 kcal — Paul a été informé que c'est une estimation à ajuster avec les données réelles de poids sur 2-3 semaines
- **Objectif calorique PDM initial** : ~3800 kcal/jour (surplus ~10%)
- **Répartition macro initiale** : ~145g protéines / ~105g lipides / ~568g glucides
- Paul anticipe personnellement une prise de poids plus rapide que ces chiffres ne le suggèrent — à surveiller et ajuster, ne pas imposer les chiffres initiaux comme fixes

## Code

Projet Vite + React dans `app/`. État actuel :
- ✅ Authentification (email/mot de passe via Supabase Auth) — `src/context/AuthContext.jsx`, `src/pages/Auth.jsx`
- ✅ Objectifs macro (formulaire + carte visuelle avec donut chart) — `src/components/GoalsCard.jsx`, `GoalsForm.jsx`, `src/lib/goals.js`
- ✅ Journal alimentaire (recherche CIQUAL + Open Food Facts, ajout par poids pesé, totaux du jour) — `src/components/FoodSearch.jsx`, `DailyTotals.jsx`, `FoodLogList.jsx`, `src/lib/foodSearch.js`, `foodLog.js`
- ⏳ Suivi du poids corporel avec courbe — pas encore fait
- ⏳ Historique des jours passés — pas encore fait
- ⏳ Déploiement Vercel — pas encore fait

## Style de collaboration attendu par Paul

- Paul a explicitement demandé d'être recadré si une direction n'est pas la bonne, plutôt que suivi sans broncher
- Il veut comprendre ce qui est fait, pas seulement recevoir un résultat — donner des explications claires à chaque étape technique, surtout pour les notions qu'il découvre
- Il préfère faire les actions lui-même quand c'est formateur (ex : création de compte, navigation dans une interface) plutôt que tout déléguer en mode automatique
- Approche validée précédemment : poser des questions de cadrage avant d'avancer, valider les hypothèses avant de coder, avancer étape par étape avec confirmation à chaque jalon plutôt que tout faire d'un coup

## Prochaines étapes suggérées

1. ~~Récupérer auprès de Paul l'URL Supabase et les clés API nécessaires~~ ✅
2. ~~Décider de l'environnement/méthode de déploiement~~ ✅ Vercel
3. ~~Construire l'authentification~~ ✅
4. ~~Intégrer Open Food Facts~~ ✅
5. ~~Construire les écrans de recherche d'aliments, journal quotidien~~ ✅
6. Suivi du poids corporel avec courbe (`body_weight_log`, table déjà prête)
7. Historique des jours passés
8. Déploiement Vercel
