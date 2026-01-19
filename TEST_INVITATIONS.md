# 🧪 Guide de Test - Système d'Invitations

## 📋 Prérequis

Avant de tester, assurez-vous que :

1. ✅ La table `trip_invitations` existe dans Supabase
2. ✅ Vous avez au moins 2 comptes utilisateur (ou 2 emails différents)
3. ✅ Vous avez créé au moins un voyage

## 🚀 Étape 1 : Créer la table dans Supabase

Si la table n'existe pas encore, exécutez ce SQL dans Supabase (SQL Editor) :

```sql
-- Création de la table trip_invitations
CREATE TABLE IF NOT EXISTS trip_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_trip_invitations_invitee_email ON trip_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_inviter_id ON trip_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_trip_id ON trip_invitations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_status ON trip_invitations(status);

-- Contrainte unique pour éviter les invitations en double
CREATE UNIQUE INDEX IF NOT EXISTS idx_trip_invitations_unique 
ON trip_invitations(trip_id, invitee_email) 
WHERE status = 'pending';
```

## 🧪 Scénarios de test

### Test 1 : Envoyer une invitation

1. **Connectez-vous** avec votre premier compte (compte invitant)
2. **Ouvrez un voyage** existant (ou créez-en un)
3. **Allez dans l'onglet "Participants"** (icône Users dans les tabs)
4. **Dans le composant InvitationManager** :
   - Saisissez l'email de votre deuxième compte (ou un email de test)
   - Cliquez sur "Envoyer l'invitation"
5. **Vérifiez** :
   - Un message de succès apparaît
   - L'email est vide (le champ est réinitialisé)

**Vérification dans Supabase** :
```sql
SELECT * FROM trip_invitations 
WHERE inviter_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 1;
```

L'invitation devrait avoir `status = 'pending'`.

---

### Test 2 : Voir les invitations reçues

1. **Déconnectez-vous** du premier compte
2. **Connectez-vous** avec le deuxième compte (l'invité)
3. **Allez dans "Mes invitations"** :
   - Cliquez sur l'icône "Inbox" dans le header
   - Ou naviguez vers `/(main)/invitations`
4. **Vérifiez** :
   - L'invitation apparaît dans la liste
   - Le nom du voyage est affiché
   - Les détails du voyage sont visibles (dates, budget)

**Note** : L'invitation doit correspondre exactement à l'email du compte connecté.

---

### Test 3 : Accepter une invitation

1. **Dans la page "Mes invitations"** (avec le compte invité)
2. **Cliquez sur "Accepter"** sur l'invitation
3. **Vérifiez** :
   - L'invitation disparaît de la liste
   - Un indicateur de chargement apparaît pendant le traitement

**Vérification dans Supabase** :

```sql
-- Vérifier que le statut est "accepted"
SELECT * FROM trip_invitations 
WHERE id = 'invitation-id';

-- Vérifier que l'utilisateur est ajouté comme participant
SELECT * FROM trip_participants 
WHERE trip_id = 'trip-id' 
AND user_id = 'invited-user-id';
```

4. **Vérifiez dans l'app** :
   - Allez dans la liste des voyages (écran principal)
   - Le voyage devrait maintenant apparaître dans "Mes voyages"

---

### Test 4 : Refuser une invitation

1. **Créez une nouvelle invitation** (Test 1)
2. **Connectez-vous avec le compte invité**
3. **Dans "Mes invitations"**, cliquez sur "Décliner"
4. **Vérifiez** :
   - L'invitation disparaît de la liste
   - Le statut dans Supabase est `'declined'`

**Vérification dans Supabase** :
```sql
SELECT * FROM trip_invitations 
WHERE status = 'declined';
```

---

### Test 5 : Test avec un seul compte (développement)

Si vous n'avez qu'un seul compte, vous pouvez tester en créant une invitation manuellement :

1. **Créez une invitation dans Supabase** :

```sql
-- Remplacez les valeurs par vos vraies données
INSERT INTO trip_invitations (
  trip_id, 
  inviter_id, 
  invitee_email, 
  status
)
VALUES (
  'your-trip-id'::uuid,
  'your-user-id'::uuid,
  'your-email@example.com',  -- Votre propre email pour tester
  'pending'
);
```

2. **Vérifiez dans l'app** :
   - L'invitation apparaît dans "Mes invitations"
   - Vous pouvez l'accepter ou la refuser

---

### Test 6 : Gestion des erreurs

1. **Test email invalide** :
   - Saisissez "email-invalide" dans InvitationManager
   - Cliquez sur "Envoyer"
   - Vérifiez qu'un message d'erreur apparaît

2. **Test email vide** :
   - Laissez le champ vide
   - Vérifiez que le bouton est désactivé

3. **Test invitation en double** :
   - Essayez d'envoyer deux invitations avec le même email au même voyage
   - La deuxième devrait échouer avec un message d'erreur approprié

---

## 🔍 Vérifications dans Supabase

### Voir toutes les invitations

```sql
SELECT 
  ti.id,
  ti.status,
  ti.invitee_email,
  ti.created_at,
  t.title as trip_name,
  u.email as inviter_email
FROM trip_invitations ti
LEFT JOIN trips t ON t.id = ti.trip_id
LEFT JOIN auth.users u ON u.id = ti.inviter_id
ORDER BY ti.created_at DESC;
```

### Voir les invitations en attente

```sql
SELECT * FROM trip_invitations 
WHERE status = 'pending';
```

### Voir les participants d'un voyage

```sql
SELECT 
  tp.user_id,
  tp.role,
  u.email,
  t.title as trip_name
FROM trip_participants tp
LEFT JOIN auth.users u ON u.id = tp.user_id
LEFT JOIN trips t ON t.id = tp.trip_id
WHERE t.id = 'your-trip-id';
```

---

## 🐛 Dépannage

### L'invitation n'apparaît pas dans "Mes invitations"

1. **Vérifiez l'email** :
   - L'email de l'invitation doit correspondre EXACTEMENT à l'email du compte connecté
   - Vérifiez les majuscules/minuscules (les emails sont normalisés en lowercase)

2. **Vérifiez le statut** :
   ```sql
   SELECT * FROM trip_invitations 
   WHERE invitee_email = 'your-email@example.com';
   ```

3. **Vérifiez les logs** :
   - Ouvrez la console du navigateur/app
   - Cherchez les logs `📧`, `✅`, `❌`

### L'invitation n'est pas créée

1. **Vérifiez les permissions RLS** :
   - La politique RLS doit permettre la création
   - Vérifiez dans Supabase > Authentication > Policies

2. **Vérifiez les logs d'erreur** :
   - Regardez la console pour les erreurs

### L'acceptation ne fonctionne pas

1. **Vérifiez que l'utilisateur est bien ajouté** :
   ```sql
   SELECT * FROM trip_participants 
   WHERE trip_id = 'trip-id' 
   AND user_id = 'user-id';
   ```

2. **Vérifiez les contraintes** :
   - S'il y a une contrainte unique sur `(trip_id, user_id)`, cela peut empêcher l'ajout

---

## 📱 Flux de test complet

### Avec deux comptes

1. **Compte 1** : Créer un voyage → Aller dans Participants → Envoyer invitation à compte2@email.com
2. **Compte 2** : Se connecter → Aller dans "Mes invitations" → Voir l'invitation
3. **Compte 2** : Accepter l'invitation → Vérifier que le voyage apparaît dans "Mes voyages"
4. **Compte 2** : Aller dans le voyage → Vérifier qu'il a accès à toutes les fonctionnalités

### Avec un seul compte (test manuel)

1. Créer une invitation manuellement dans Supabase avec votre propre email
2. Rafraîchir l'app → Voir l'invitation dans "Mes invitations"
3. Accepter l'invitation → Vérifier dans trip_participants

---

## ✅ Checklist de test

- [ ] La table `trip_invitations` existe dans Supabase
- [ ] Je peux envoyer une invitation depuis InvitationManager
- [ ] L'invitation est créée dans Supabase avec status='pending'
- [ ] Je peux voir les invitations reçues dans "Mes invitations"
- [ ] Je peux accepter une invitation
- [ ] Après acceptation, je suis ajouté dans `trip_participants`
- [ ] Après acceptation, le voyage apparaît dans "Mes voyages"
- [ ] Je peux refuser une invitation
- [ ] Après refus, le statut est 'declined' dans Supabase
- [ ] Les erreurs sont gérées correctement (email invalide, doublon, etc.)

---

## 🎯 Points importants à vérifier

1. **Email normalisé** : Les emails sont automatiquement convertis en lowercase
2. **Contrainte unique** : Une seule invitation "pending" par couple (trip_id, invitee_email)
3. **RLS** : Les utilisateurs ne voient que leurs propres invitations
4. **Statut** : Les invitations peuvent être 'pending', 'accepted', ou 'declined'
5. **Automatisation** : L'acceptation ajoute automatiquement l'utilisateur comme participant

---

## 💡 Astuces de test

1. **Utilisez des emails de test** :
   - `test1@example.com`
   - `test2@example.com`

2. **Créez des invitations directement dans Supabase** pour tester rapidement :
   ```sql
   INSERT INTO trip_invitations (trip_id, inviter_id, invitee_email, status)
   VALUES (...);
   ```

3. **Vérifiez les logs dans la console** :
   - Cherchez les emojis : 📧, ✅, ❌
   - Les logs détaillent chaque étape du processus

4. **Testez avec différents statuts** :
   - Créez des invitations avec différents statuts dans Supabase
   - Vérifiez que seules les invitations 'pending' apparaissent

---

Bon test ! 🚀
