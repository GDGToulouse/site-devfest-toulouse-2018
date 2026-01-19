# Plan de Migration : Site Statique DevFest Toulouse 2018

## Objectif
Convertir le site DevFest Toulouse 2018 en site statique (sans Firebase) et le déployer sur un hébergement mutualisé OVH avec Apache pour répondre aux adresses :
- `2018.devfesttoulouse.fr`
- `test.2018.devfesttoulouse.fr`

---

## Résumé des Modifications

### 1. Extraction des Données JSON

**Fichier source** : `data/firebase-data.json` contient toutes les données.

**Créer des fichiers JSON séparés dans `data/` :**

| Fichier | Contenu |
|---------|---------|
| `data/sessions.json` | 50 sessions |
| `data/speakers.json` | 42 speakers |
| `data/schedule.json` | Planning (1 jour) |
| `data/blog.json` | 3 articles |
| `data/partners.json` | 5 groupes de partenaires |
| `data/team.json` | 1 équipe |
| `data/tickets.json` | 3 tickets |
| `data/videos.json` | Tableau vide `[]` |
| `data/gallery.json` | Tableau vide `[]` |

---

### 2. Modification de `index.html`

**Supprimer :**
- Fonction `loadFirebaseModules()`
- Appels `firebase.initializeApp()`, `firebase.firestore()`, `firebase.auth()`, `firebase.messaging()`
- Liens preconnect vers Firebase (firestore.googleapis.com, fcm.googleapis.com)

**Remplacer le script d'initialisation par :**
```javascript
window.Polymer = { rootPath: '{$ basepath $}' };
window.HOVERBOARD = { Elements: {} };

function loadHoverboardApp() {
  requestAnimationFrame(() => {
    const app = document.createElement('hoverboard-app');
    document.body.appendChild(app);
  });
}
loadHoverboardApp();
```

---

### 3. Réécriture de `scripts/redux/actions.js`

**Remplacer tous les appels Firestore par des fetch JSON :**

| Avant (Firebase) | Après (JSON statique) |
|------------------|----------------------|
| `firebase.firestore().collection('sessions').get()` | `fetch('/data/sessions.json').then(r => r.json())` |
| `firebase.firestore().collection('speakers').get()` | `fetch('/data/speakers.json').then(r => r.json())` |
| `firebase.firestore().collection('schedule').get()` | `fetch('/data/schedule.json').then(r => r.json())` |
| `firebase.firestore().collection('blog').get()` | `fetch('/data/blog.json').then(r => r.json())` |
| `firebase.firestore().collection('partners').get()` | `fetch('/data/partners.json').then(r => r.json())` |
| `firebase.firestore().collection('team').get()` | `fetch('/data/team.json').then(r => r.json())` |
| `firebase.firestore().collection('tickets').get()` | `fetch('/data/tickets.json').then(r => r.json())` |
| `firebase.firestore().collection('videos').get()` | `fetch('/data/videos.json').then(r => r.json())` |
| `firebase.firestore().collection('gallery').get()` | `fetch('/data/gallery.json').then(r => r.json())` |

**Supprimer entièrement :**
- `userActions` (authentification)
- `subscribeActions` (newsletter via Firestore)
- `notificationsActions` (push notifications)
- `sessionsActions.fetchUserFeaturedSessions()` et `setUserFeaturedSessions()`
- `partnersActions.addPartner()` (écriture Firestore)
- `helperActions.getFederatedProvider()` et `getProviderCompanyName()`

---

### 4. Suppression des Fichiers Inutiles

```
À SUPPRIMER :
├── firebase-messaging-sw.js
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── database.rules.json
├── .firebaserc
├── functions/                 (tout le dossier)
└── internals/                 (tout le dossier)
```

---

### 5. Mise à jour de la Configuration

**`config/production.json` :**
```json
{
  "basepath": "/",
  "url": "https://2018.devfesttoulouse.fr/",
  "analytics": "UA-37717223-7",
  "googleMapApiKey": "AIzaSyAsYarycfx4sV9QhauT5li-63snSTqoJ3g"
}
```

**`config/development.json` :**
```json
{
  "basepath": "/",
  "url": "http://localhost:3000/",
  "analytics": "",
  "googleMapApiKey": "AIzaSyAsYarycfx4sV9QhauT5li-63snSTqoJ3g"
}
```

---

### 6. Nettoyage des Dépendances

**`bower.json` :** Supprimer la ligne `"firebase": "^5.1.0"`

**`package.json` :** Supprimer :
- `"firebase-admin": "..."`
- `"firebase-tools": "..."`
- Scripts `"firestore:*"` et `"deploy"`

**`polymer.json` :** Retirer les références à `bower_components/firebase/` dans `extraDependencies`

**`sw-precache-config.js` :** Retirer le caching des libs Firebase

---

### 7. Adaptation des Composants UI

**Composants à modifier pour masquer les fonctionnalités auth :**
- `src/elements/dialogs/signin-dialog.html` - Masquer ou supprimer
- `src/elements/dialogs/subscribe-dialog.html` - Option : rediriger vers Mailchimp direct
- `src/elements/header-toolbar.html` - Masquer le bouton de connexion

---

### 8. Configuration Apache pour OVH

**Créer `.htaccess` à la racine du build :**

```apache
# Activer le mod_rewrite
RewriteEngine On

# Forcer HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA Fallback - Toutes les routes vers index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Cache statique (images, JS, CSS)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/json "access plus 1 week"
</IfModule>

# Compression GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Headers de sécurité
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Types MIME
AddType application/javascript .js
AddType application/json .json
AddType text/html .html
```

---

### 9. Configuration DNS et Structure OVH

**Structure des dossiers sur OVH :**
```
/www/
└── 2018/                    # Contenu du dossier build/
    ├── index.html
    ├── .htaccess
    ├── manifest.json
    ├── service-worker.js
    ├── src/
    ├── data/
    ├── images/
    ├── scripts/
    └── bower_components/
```

**Configuration DNS (chez OVH ou registrar) :**
```
2018.devfesttoulouse.fr         A     <IP du serveur OVH>
test.2018.devfesttoulouse.fr    A     <IP du serveur OVH>
```

**Si accès à la configuration Apache (VirtualHost) :**
```apache
<VirtualHost *:80>
    ServerName 2018.devfesttoulouse.fr
    ServerAlias test.2018.devfesttoulouse.fr
    DocumentRoot /home/user/www/2018

    <Directory /home/user/www/2018>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**Alternative hébergement mutualisé OVH :**
- Créer un sous-domaine `2018` dans le panel OVH
- Le pointer vers le dossier `/www/2018/`
- Le `.htaccess` gérera le reste

---

## Fichiers à Modifier (Liste Complète)

| Fichier | Action |
|---------|--------|
| `data/sessions.json` | **CRÉER** - Extraire de firebase-data.json |
| `data/speakers.json` | **CRÉER** - Extraire de firebase-data.json |
| `data/schedule.json` | **CRÉER** - Extraire de firebase-data.json |
| `data/blog.json` | **CRÉER** - Extraire de firebase-data.json |
| `data/partners.json` | **CRÉER** - Extraire de firebase-data.json |
| `data/team.json` | **CRÉER** - Extraire de firebase-data.json |
| `data/tickets.json` | **CRÉER** - Extraire de firebase-data.json |
| `data/videos.json` | **CRÉER** - Tableau vide |
| `data/gallery.json` | **CRÉER** - Tableau vide |
| `index.html` | **MODIFIER** - Supprimer init Firebase |
| `scripts/redux/actions.js` | **MODIFIER** - Remplacer Firestore par fetch JSON |
| `config/production.json` | **MODIFIER** - Supprimer config Firebase, changer URL |
| `config/development.json` | **MODIFIER** - Supprimer config Firebase |
| `bower.json` | **MODIFIER** - Supprimer dépendance firebase |
| `package.json` | **MODIFIER** - Supprimer dépendances Firebase |
| `polymer.json` | **MODIFIER** - Retirer sources Firebase |
| `sw-precache-config.js` | **MODIFIER** - Retirer caching Firebase |
| `.htaccess` | **CRÉER** - Configuration Apache SPA |
| `firebase-messaging-sw.js` | **SUPPRIMER** |
| `firebase.json` | **SUPPRIMER** |
| `firestore.rules` | **SUPPRIMER** |
| `firestore.indexes.json` | **SUPPRIMER** |
| `database.rules.json` | **SUPPRIMER** |
| `.firebaserc` | **SUPPRIMER** |
| `functions/` | **SUPPRIMER** (tout le dossier) |
| `internals/` | **SUPPRIMER** (tout le dossier) |

---

## Étapes de Déploiement

### 1. Appliquer les modifications au code
Suivre les sections 1 à 7 ci-dessus.

### 2. Build du projet
```bash
npm install
npm run build:prod
```

### 3. Déploiement sur OVH
- Copier le contenu de `build/` vers `/www/2018/` sur OVH (via FTP ou SSH)
- Ajouter le fichier `.htaccess` à la racine

### 4. Configuration DNS
- Ajouter les enregistrements DNS A pour `2018.devfesttoulouse.fr` et `test.2018.devfesttoulouse.fr`

### 5. SSL/HTTPS
- Activer Let's Encrypt via le panel OVH pour les deux sous-domaines

---

## Checklist de Vérification

Après déploiement, vérifier :

- [ ] Page d'accueil charge correctement
- [ ] Navigation SPA fonctionne (/schedule, /speakers, /blog)
- [ ] Les données JSON sont chargées (speakers affichés, programme visible)
- [ ] Les images s'affichent correctement
- [ ] HTTPS fonctionne et redirige depuis HTTP
- [ ] Refresh sur une sous-route (ex: /schedule/) fonctionne (SPA fallback)
- [ ] Le site fonctionne sur mobile
- [ ] Les deux domaines répondent (test.2018 et 2018)

---

## Notes

- L'événement DevFest 2018 est passé, donc les fonctionnalités d'authentification et de sessions favorites ne sont plus nécessaires
- Le site devient une archive consultable
- Aucune maintenance backend n'est requise
- Hébergement gratuit/peu coûteux possible (OVH mutualisé, GitHub Pages, Netlify, etc.)
