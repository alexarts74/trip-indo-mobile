# 📧 Système d'Invitations aux Voyages

## 🚀 Installation et Configuration

### 1. Installation des dépendances

Les dépendances nécessaires sont déjà installées :
- `resend` : Pour l'envoi d'emails
- `@supabase/supabase-js` : Pour l'interaction avec Supabase

### 2. Configuration de la base de données

Exécutez le script SQL dans Supabase pour créer la table `trip_invitations` :

```sql
-- Voir le fichier: supabase/migrations/create_trip_invitations.sql
```

Vous pouvez exécuter ce script directement dans l'éditeur SQL de Supabase.

### 3. Configuration de Resend

1. Créer un compte sur [Resend](https://resend.com)
2. Obtenir une clé API
3. Ajouter la clé API dans les variables d'environnement de Supabase :
   - Allez dans Supabase Dashboard > Project Settings > Edge Functions
   - Ajoutez la variable d'environnement : `RESEND_API_KEY` = `re_xxxxxxxxxxxxx`

### 4. Déploiement de la Supabase Edge Function

Pour déployer la fonction `send-invitation` :

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref your-project-ref

# Déployer la fonction
supabase functions deploy send-invitation
```

Ou via le dashboard Supabase :
1. Allez dans Edge Functions
2. Créez une nouvelle fonction
3. Nommez-la `send-invitation`
4. Copiez le contenu de `supabase/functions/send-invitation/index.ts`
5. Déployez

### 5. Variables d'environnement

Assurez-vous d'avoir ces variables dans votre fichier `.env` :

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_APP_URL=https://your-app-url.com  # Optionnel, pour les liens dans les emails
```

Et dans Supabase Edge Functions :
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EXPO_PUBLIC_APP_URL=https://your-app-url.com
```

## 📁 Structure des fichiers

```
src/
├── services/
│   └── invitationService.ts          # Service pour gérer les invitations
components/
├── trip/
│   ├── InvitationManager.tsx         # Composant pour envoyer des invitations
│   └── TripParticipants.tsx          # Composant mis à jour avec InvitationManager
app/
├── (main)/
│   └── invitations.tsx               # Page pour voir les invitations reçues
supabase/
├── functions/
│   └── send-invitation/
│       └── index.ts                  # Edge Function pour envoyer les emails
└── migrations/
    └── create_trip_invitations.sql   # Script SQL pour créer la table
```

## 🔧 Utilisation

### Envoyer une invitation

Le composant `InvitationManager` est intégré dans `TripParticipants`. Il permet d'envoyer des invitations directement depuis la page des participants d'un voyage.

### Voir les invitations reçues

La page `app/(main)/invitations.tsx` affiche toutes les invitations en attente reçues par l'utilisateur connecté.

### Accepter/Refuser une invitation

Depuis la page des invitations, l'utilisateur peut accepter ou refuser une invitation. Lors de l'acceptation :
- Le statut de l'invitation passe à "accepted"
- L'utilisateur est automatiquement ajouté comme participant au voyage

## 🔄 Flux complet

1. **Envoi d'invitation** :
   - L'utilisateur saisit un email dans `InvitationManager`
   - L'invitation est créée dans `trip_invitations` (status: "pending")
   - Un email est envoyé via la Supabase Edge Function (si configurée)

2. **Réception** :
   - L'invité reçoit l'email (si Resend est configuré)
   - L'invitation apparaît dans la page "Mes invitations" si l'email correspond

3. **Acceptation** :
   - L'utilisateur clique sur "Accepter"
   - Le statut passe à "accepted"
   - L'utilisateur est ajouté dans `trip_participants`
   - Le voyage apparaît dans sa liste de voyages

## ⚠️ Notes importantes

1. **Identification par email** : Le système identifie les invitations par l'email de l'invité. L'invité doit avoir un compte avec le même email pour voir l'invitation.

2. **Configuration email optionnelle** : Si Resend n'est pas configuré, l'invitation sera créée dans la base de données mais l'email ne sera pas envoyé. L'invitation sera toujours visible dans l'application.

3. **Contrainte unique** : Une seule invitation "pending" est autorisée par couple (trip_id, invitee_email) pour éviter les doublons.

4. **RLS activé** : Les politiques de sécurité sont configurées pour que les utilisateurs ne voient que leurs propres invitations.

## 🐛 Dépannage

### L'email n'est pas envoyé

1. Vérifiez que `RESEND_API_KEY` est configurée dans Supabase Edge Functions
2. Vérifiez les logs de la fonction dans Supabase Dashboard
3. L'invitation est créée même si l'email échoue

### L'invitation n'apparaît pas

1. Vérifiez que l'email de l'invité correspond exactement à son email de compte
2. Vérifiez que l'invitation a bien été créée dans Supabase
3. Vérifiez les politiques RLS

### Erreur "duplicate key"

Cela signifie qu'une invitation en attente existe déjà pour ce voyage et cet email. Vous pouvez soit :
- Attendre que l'invitation soit acceptée/refusée
- Supprimer l'ancienne invitation manuellement dans Supabase
