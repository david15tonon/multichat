# Guide de Déploiement MultiChat

## 🚀 Déploiement sur Vercel (Recommandé)

Vercel est la plateforme recommandée pour déployer MultiChat car elle est optimisée pour Vite et React.

### Méthode 1 : Via l'interface Vercel (Plus simple)

1. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Inscrivez-vous avec GitHub, GitLab ou Bitbucket

2. **Importer le projet**
   - Cliquez sur "New Project"
   - Sélectionnez votre repository MultiChat
   - Vercel détectera automatiquement Vite

3. **Configuration automatique**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   
4. **Variables d'environnement** (optionnel)
   - Ajoutez vos variables d'environnement dans les settings
   - Copiez depuis `.env.example`

5. **Déployer**
   - Cliquez sur "Deploy"
   - Votre site sera disponible en ~2 minutes

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Pour production
vercel --prod
```

---

## 📦 Déploiement sur Netlify

### Via l'interface Netlify

1. **Créer un compte** sur [netlify.com](https://netlify.com)

2. **Importer le projet**
   - "New site from Git"
   - Sélectionnez votre repository

3. **Configuration Build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Déployer**

### Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Build
npm run build

# Déployer
netlify deploy --prod --dir=dist
```

---

## 🌐 Déploiement sur GitHub Pages

1. **Modifier `vite.config.ts`**
```typescript
export default defineConfig({
  base: '/multichat/', // Nom de votre repo
  // ... reste de la config
});
```

2. **Installer gh-pages**
```bash
npm install --save-dev gh-pages
```

3. **Ajouter scripts dans `package.json`**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. **Déployer**
```bash
npm run deploy
```

5. **Configurer GitHub Pages**
   - Settings > Pages
   - Source: gh-pages branch
   - Votre site: `https://username.github.io/multichat/`

---

## ☁️ Déploiement sur AWS Amplify

1. **Installer Amplify CLI**
```bash
npm install -g @aws-amplify/cli
amplify configure
```

2. **Initialiser Amplify**
```bash
amplify init
```

3. **Ajouter l'hosting**
```bash
amplify add hosting
```

4. **Publier**
```bash
amplify publish
```

---

## 🐳 Déploiement avec Docker

### Créer Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Créer nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Build et Run

```bash
# Build image
docker build -t multichat .

# Run container
docker run -p 80:80 multichat
```

---

## 🔧 Configuration Post-Déploiement

### Variables d'Environnement

Configurez ces variables selon votre plateforme :

```env
VITE_API_URL=https://api.votre-domaine.com
VITE_TRANSLATION_API_KEY=votre_clé_api
VITE_ENV=production
```

### Custom Domain

#### Vercel
1. Settings > Domains
2. Ajoutez votre domaine
3. Configurez les DNS records

#### Netlify
1. Domain settings
2. Add custom domain
3. Configure DNS

### SSL/HTTPS

Vercel et Netlify fournissent automatiquement des certificats SSL gratuits via Let's Encrypt.

---

## 🔍 Optimisations Production

### 1. Code Splitting

Vite fait automatiquement du code splitting, mais vous pouvez optimiser :

```typescript
// Lazy loading des pages
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
```

### 2. Image Optimization

- Utilisez des formats modernes (WebP, AVIF)
- Lazy load les images
- Utilisez un CDN pour les assets

### 3. Bundle Size Analysis

```bash
npm run build -- --mode analyze
```

### 4. Compression

Activez la compression Gzip/Brotli sur votre serveur.

---

## 📊 Monitoring

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Google Analytics

```bash
npm install react-ga4
```

### Sentry (Error Tracking)

```bash
npm install @sentry/react
```

---

## 🧪 Testing Avant Déploiement

```bash
# Build local
npm run build

# Test le build
npm run preview

# Vérifiez sur http://localhost:4173
```

---

## 📝 Checklist de Déploiement

- [ ] Tests passent
- [ ] Build réussit sans erreurs
- [ ] Variables d'environnement configurées
- [ ] `.gitignore` à jour
- [ ] README.md complet
- [ ] License ajoutée
- [ ] Meta tags SEO ajoutés
- [ ] Favicon configuré
- [ ] PWA manifest (optionnel)
- [ ] Analytics configuré
- [ ] Error tracking configuré
- [ ] HTTPS activé
- [ ] Custom domain configuré (si applicable)

---

## 🔄 CI/CD avec GitHub Actions

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🆘 Troubleshooting

### Build échoue

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routes 404

Vérifiez que votre plateforme est configurée pour les SPAs :
- Vercel : automatique avec le fichier `vercel.json`
- Netlify : créez `_redirects` dans `/public`
```
/*    /index.html   200
```

### Variables d'environnement non définies

- Préfixez avec `VITE_` pour Vite
- Redéployez après avoir ajouté des variables

---

## 📞 Support

- Documentation Vite : [vitejs.dev](https://vitejs.dev)
- Documentation Vercel : [vercel.com/docs](https://vercel.com/docs)
- Support MultiChat : créez une issue sur GitHub

---

**Bon déploiement ! 🚀**
