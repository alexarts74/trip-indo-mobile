# TripMate

Application mobile React Native avec Expo pour la gestion de voyages en Indonésie.

## 🏗️ Structure du Projet

```
trip-mate-mobile/
├── app/                    # Navigation et écrans (Expo Router)
│   ├── (tabs)/            # Navigation par onglets
│   │   ├── _layout.tsx    # Layout des onglets
│   │   └── index.tsx      # Écran principal avec liste des voyages
│   ├── _layout.tsx        # Layout principal
│   └── modal.tsx          # Modal
├── components/             # Composants réutilisables
│   └── TripList.tsx       # Liste des voyages
├── src/                    # Code source principal
│   ├── lib/               # Bibliothèques et clients
│   │   └── supabaseClient.ts
│   ├── services/          # Services métier
│   │   └── tripService.ts
│   ├── types/             # Types TypeScript
│   │   └── trip.ts
│   └── constants/         # Constantes et thème
│       └── theme.ts
├── assets/                 # Images, polices, etc.
└── constants/              # Constantes de l'application
```

## 🚀 Configuration Supabase

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-supabase
```

### Structure de la base de données

Assurez-vous d'avoir les tables suivantes dans votre base Supabase :

- `trips` : Voyages
- `trip_participants` : Participants aux voyages
- `users` : Utilisateurs (géré par Supabase Auth)

## 📱 Fonctionnalités

### Écran Principal

- Liste des voyages de l'utilisateur (créés + participations)
- Affichage des informations clés : titre, dates, budget, durée
- État de chargement et gestion d'erreurs
- Interface pour créer un nouveau voyage

### Composants

- **TripList** : Composant principal pour afficher la liste des voyages
- **Services** : Logique métier centralisée pour les opérations Supabase
- **Types** : Interfaces TypeScript pour la cohérence des données
- **Thème** : Système de design centralisé avec couleurs et espacements

## 🎨 Design System

L'application utilise un système de design cohérent avec :

- **Couleurs** : Palette orange/grise avec des variantes
- **Espacements** : Système d'échelle cohérent (xs, sm, md, lg, xl, xxl, xxxl)
- **Bordures** : Rayons de bordure standardisés
- **Ombres** : Système d'ombres pour la profondeur

## 📦 Dépendances Principales

- **React Native** + **Expo**
- **Supabase** pour la base de données et l'authentification
- **Expo Router** pour la navigation
- **TypeScript** pour le typage

## 🔧 Développement

```bash
# Installation des dépendances
npm install

# Démarrage de l'application
npm start

# Ou spécifiquement pour iOS/Android
npm run ios
npm run android
```

## 🚧 Prochaines Étapes

- [ ] Page de création de voyage
- [ ] Page de détails du voyage
- [ ] Système d'authentification
- [ ] Gestion des participants
- [ ] Planification des activités
