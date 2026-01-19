# 🚀 Configuration Resend pour la Production

## 📋 Checklist pour passer en production

### ✅ Étape 1 : Vérifier un domaine dans Resend

1. **Connectez-vous à [resend.com](https://resend.com)**
2. **Allez dans "Domains"** : [resend.com/domains](https://resend.com/domains)
3. **Cliquez sur "Add Domain"**
4. **Entrez votre domaine** :
   - Exemple : `tripmate.com` ou `app.tripmate.com`
   - Vous pouvez utiliser un sous-domaine si vous préférez
5. **Ajoutez les enregistrements DNS** :
   - Resend vous donnera des enregistrements à ajouter dans votre DNS
   - Types d'enregistrements : TXT, CNAME, MX
   - Suivez les instructions exactes fournies par Resend
6. **Attendez la vérification** :
   - La vérification peut prendre de quelques minutes à 48h
   - Vous recevrez un email de confirmation une fois vérifié

### ✅ Étape 2 : Configurer l'adresse "from" dans Supabase

Une fois votre domaine vérifié, configurez l'adresse email d'envoi :

#### Option A : Via Supabase CLI (Recommandé)

```bash
# Remplacez par votre domaine vérifié
supabase secrets set RESEND_FROM_EMAIL="TripMate <noreply@votre-domaine.com>"
```

#### Option B : Via Supabase Dashboard

1. Allez dans votre projet Supabase
2. **Edge Functions** > `send-invitation`
3. **Settings** ou **Secrets**
4. **Add Secret** :
   - **Name** : `RESEND_FROM_EMAIL`
   - **Value** : `TripMate <noreply@votre-domaine.com>`
   - (Remplacez `votre-domaine.com` par votre domaine vérifié)

### ✅ Étape 3 : Redéployer la fonction (si nécessaire)

```bash
supabase functions deploy send-invitation
```

### ✅ Étape 4 : Tester

1. **Envoyez une invitation** à une adresse email différente de la vôtre
2. **Vérifiez les logs** dans Supabase Edge Functions
3. **Vérifiez votre boîte email** (et celle du destinataire)

## 🎯 Exemple de configuration complète

```bash
# 1. Clé API (déjà configurée)
supabase secrets set RESEND_API_KEY=re_gKVCsmuS_CN1BN8YQpZvqhH6h2gQv7obX

# 2. Adresse from avec votre domaine vérifié
supabase secrets set RESEND_FROM_EMAIL="TripMate <noreply@tripmate.com>"

# 3. URL de l'app (optionnel, pour les liens dans les emails)
supabase secrets set EXPO_PUBLIC_APP_URL=https://tripmate.app

# 4. Redéployer
supabase functions deploy send-invitation
```

## 🔍 Vérification

Après configuration, les logs devraient montrer :

```
📧 [Edge Function] Configuration email: {
  from: "TripMate <noreply@votre-domaine.com>",
  to: "destinataire@example.com",
  subject: "✈️ Invitation au voyage : ..."
}
✅ [Edge Function] Email envoyé avec succès!
```

## ⚠️ Notes importantes

- **Le domaine doit être complètement vérifié** avant de pouvoir envoyer à d'autres adresses
- **L'adresse "from" doit utiliser votre domaine vérifié** (pas `@resend.dev`)
- **Vous pouvez utiliser n'importe quel nom d'utilisateur** avant le `@` (ex: `noreply@`, `contact@`, `hello@`)
- **Les emails seront envoyés depuis votre domaine**, ce qui améliore la délivrabilité

## 🆘 Dépannage

### Erreur : "Domain not verified"
- Vérifiez que tous les enregistrements DNS sont correctement configurés
- Attendez que la vérification soit complète (peut prendre jusqu'à 48h)

### Erreur : "Invalid from address"
- Vérifiez que l'adresse `from` utilise exactement votre domaine vérifié
- Vérifiez que le secret `RESEND_FROM_EMAIL` est bien configuré dans Supabase

### Les emails n'arrivent pas
- Vérifiez les logs dans Supabase Edge Functions
- Vérifiez les spams
- Vérifiez que le domaine est bien vérifié dans Resend
