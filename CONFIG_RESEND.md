# 🔐 Configuration de Resend dans Supabase Edge Functions

## ⚠️ IMPORTANT - Sécurité

**NE METTEZ PAS `RESEND_API_KEY` dans votre fichier `.env` React Native !**

La clé API Resend est une **clé secrète** qui doit rester sur le serveur. Si vous la mettez dans `.env`, elle sera exposée dans le code JavaScript du client, ce qui est un risque de sécurité majeur.

## ✅ Configuration correcte : Dans Supabase Edge Functions

La clé doit être configurée dans **Supabase Edge Functions** (côté serveur) :

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Allez dans Supabase Dashboard** > Votre projet
2. **Cliquez sur "Edge Functions"** dans le menu de gauche
3. **Sélectionnez la fonction `send-invitation`** (ou créez-la si elle n'existe pas)
4. **Allez dans l'onglet "Settings"** ou "Secrets"
5. **Cliquez sur "Add Secret"**
6. **Entrez** :
   - **Name** : `RESEND_API_KEY`
   - **Value** : `re_gKVCsmuS_CN1BN8YQpZvqhH6h2gQv7obX`
7. **Sauvegardez**

### Option 2 : Via Supabase CLI

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet
supabase link --project-ref your-project-ref

# Configurer le secret
supabase secrets set RESEND_API_KEY=re_gKVCsmuS_CN1BN8YQpZvqhH6h2gQv7obX
```

## 🔍 Vérification

Après avoir configuré la clé, testez en envoyant une invitation. Les logs dans Supabase Edge Functions devraient montrer :

```
📧 [Edge Function] RESEND_API_KEY configurée: true
✅ [Edge Function] RESEND_API_KEY trouvée, initialisation de Resend...
✅ [Edge Function] Email envoyé avec succès!
```

## 🌐 Configuration pour la Production (Domaine vérifié)

En mode test, Resend ne permet d'envoyer des emails qu'à votre propre adresse. Pour la production, vous devez :

### 1. Vérifier un domaine dans Resend

1. **Allez sur [resend.com/domains](https://resend.com/domains)**
2. **Cliquez sur "Add Domain"**
3. **Entrez votre domaine** (ex: `tripmate.com`, `app.tripmate.com`)
4. **Suivez les instructions** pour ajouter les enregistrements DNS requis
5. **Attendez la vérification** (peut prendre quelques minutes)

### 2. Configurer l'adresse "from" dans Supabase

Une fois votre domaine vérifié, configurez l'adresse email d'envoi :

**Via Supabase CLI :**
```bash
supabase secrets set RESEND_FROM_EMAIL="TripMate <noreply@votre-domaine.com>"
```

**Via Supabase Dashboard :**
1. Allez dans **Edge Functions** > `send-invitation` > **Settings/Secrets**
2. Ajoutez un nouveau secret :
   - **Name** : `RESEND_FROM_EMAIL`
   - **Value** : `TripMate <noreply@votre-domaine.com>` (remplacez par votre domaine)

### 3. Redéployer la fonction (si nécessaire)

```bash
supabase functions deploy send-invitation
```

## 📝 Variables d'environnement dans le projet

Votre fichier `.env` ne doit contenir QUE ces variables (pas `RESEND_API_KEY` ni `RESEND_FROM_EMAIL`) :

```env
# Supabase (pour le client)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App URL (optionnel, pour les liens dans les emails)
EXPO_PUBLIC_APP_URL=https://your-app-url.com

# PAS DE RESEND_API_KEY ICI ! ⚠️
# PAS DE RESEND_FROM_EMAIL ICI ! ⚠️
```

Les secrets `RESEND_API_KEY` et `RESEND_FROM_EMAIL` restent uniquement dans Supabase Edge Functions (serveur).

## 🔄 Mode Test vs Production

- **Mode Test** : Utilise `onboarding@resend.dev` (par défaut), envoi uniquement à votre email
- **Mode Production** : Utilise votre domaine vérifié, envoi à n'importe quelle adresse
