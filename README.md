# ToonBook Backend

Backend pour une application de gestion de livres numériques (romans, mangas, manhwas, comics).

## Prérequis

- Node.js (v14 ou supérieur)
- PostgreSQL
- npm ou yarn
- Docker (optionnel)

## Configuration de la Base de Données

1. Créer une base de données PostgreSQL :
```sql
CREATE DATABASE toonbook;
```

2. Configurer les variables d'environnement :
Créer un fichier `.env` à la racine du projet avec :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toonbook
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt
PORT=3000
```

## Installation

1. Cloner le repository :
```bash
git clone [url-du-repo]
cd toonbook/backend
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer les dossiers pour les images :
```bash
mkdir -p public/images/covers public/images/contents
```

4. Lancer les migrations de la base de données :
```bash
npm run migrate
```

## Lancement

1. En mode développement :
```bash
npm run dev
```

2. En mode production :
```bash
npm run build
npm start
```

## Déploiement avec Docker

1. Construire l'image Docker :
```bash
docker build -t toonbook-backend .
```

2. Lancer l'application :
```bash
docker run -d \
  --name toonbook-backend \
  -p 3000:3000 \
  -e DB_HOST=votre_host_bdd \
  -e DB_PORT=votre_port_bdd \
  -e DB_NAME=votre_nom_bdd \
  -e DB_USER=votre_utilisateur \
  -e DB_PASSWORD=votre_mot_de_passe \
  -e JWT_SECRET=votre_secret_jwt \
  -e PORT=3000 \
  -v $(pwd)/public/images:/app/public/images \
  toonbook-backend
```

3. Lancer les migrations :
```bash
docker exec toonbook-backend npm run migrate
```

### Docker Compose

Alternativement, vous pouvez utiliser Docker Compose pour un déploiement plus simple :

1. Créer un fichier `docker-compose.yml` :
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: votre_host_bdd
      DB_PORT: votre_port_bdd
      DB_NAME: votre_nom_bdd
      DB_USER: votre_utilisateur
      DB_PASSWORD: votre_mot_de_passe
      JWT_SECRET: votre_secret_jwt
      PORT: 3000
    volumes:
      - ./public/images:/app/public/images
```

2. Lancer l'application avec Docker Compose :
```bash
docker-compose up -d
```

3. Lancer les migrations :
```bash
docker-compose exec backend npm run migrate
```

## Structure de l'API

### Routes Publiques

#### Livres
- `GET /api/books` - Liste tous les livres
- `GET /api/books/:id` - Détails d'un livre

#### Chapitres
- `GET /api/chapters` - Liste tous les chapitres
- `GET /api/chapters/:id` - Détails d'un chapitre
- `GET /api/chapters/book/:bookId` - Chapitres d'un livre

#### Contenu
- `GET /api/book-content` - Liste tout le contenu
- `GET /api/book-content/:id` - Détails d'un contenu
- `GET /api/book-content/chapter/:chapterId` - Contenu d'un chapitre

### Routes Protégées (nécessitent une authentification)

#### Livres
- `POST /api/books` - Créer un livre
- `PUT /api/books/:id` - Mettre à jour un livre
- `DELETE /api/books/:id` - Supprimer un livre

#### Chapitres
- `POST /api/chapters` - Créer un chapitre
- `PUT /api/chapters/:id` - Mettre à jour un chapitre
- `DELETE /api/chapters/:id` - Supprimer un chapitre

#### Contenu
- `POST /api/book-content` - Créer du contenu
- `PUT /api/book-content/:id` - Mettre à jour du contenu
- `DELETE /api/book-content/:id` - Supprimer du contenu

## Authentification

Pour les routes protégées, inclure le token JWT dans le header :
```
Authorization: Bearer votre_token_jwt
```

## Upload de Fichiers

### Couverture de Livre
```
POST /api/books
Content-Type: multipart/form-data

Fields:
- title: string
- description: string
- user_id: number
- status: string
- category_id: number
- bookType_id: number
- type: string
- cover: file (image)
```

### Image de Contenu
```
POST /api/book-content
Content-Type: multipart/form-data

Fields:
- chapter_id: number
- content: string
- order: number
- image: file (image)
```

## Types de Livres Supportés

- NOVEL (Roman)
- MANGA
- MANHWA
- COMIC (Bande dessinée)

## Structure des Dossiers

```
src/
├── config/         # Configuration (base de données, etc.)
├── controllers/    # Contrôleurs de l'API
├── middlewares/    # Middlewares (auth, upload, etc.)
├── routes/         # Routes de l'API
├── services/       # Logique métier
└── types/          # Types TypeScript
```

## Tests

Pour lancer les tests :
```bash
npm test
```

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

MIT

## Test des Uploads avec Postman

### Configuration de Postman

1. Créer une nouvelle requête POST
2. Dans l'onglet "Body" :
   - Sélectionner "form-data"
   - Pour les champs texte, laisser le type "Text"
   - Pour le champ d'image, cliquer sur le bouton "File" à droite du champ

### Test d'Upload de Couverture

```
POST http://localhost:3000/api/books
Headers:
- Authorization: Bearer votre_token_jwt

Body (form-data):
- title: "Mon Premier Livre"
- description: "Une histoire passionnante"
- user_id: 1
- status: "draft"
- category_id: 1
- bookType_id: 1
- type: "NOVEL"
- cover: [sélectionner une image]
```

### Test d'Upload de Contenu

```
POST http://localhost:3000/api/book-content
Headers:
- Authorization: Bearer votre_token_jwt

Body (form-data):
- chapter_id: 1
- content: "Première page du chapitre"
- order: 1
- image: [sélectionner une image]
```

### Points Importants

1. Assurez-vous que le token JWT est valide
2. Les images doivent être au format : JPEG, PNG, GIF ou WEBP
3. Taille maximale des images : 5MB
4. Les noms des champs dans form-data doivent correspondre exactement à ceux attendus par l'API
5. Pour le champ d'image, ne pas mettre de guillemets autour du nom du fichier

### Exemple de Configuration Postman

1. Ouvrir Postman
2. Créer une nouvelle requête
3. Sélectionner la méthode POST
4. Entrer l'URL
5. Dans l'onglet "Headers" :
   ```
   Authorization: Bearer votre_token_jwt
   ```
6. Dans l'onglet "Body" :
   - Sélectionner "form-data"
   - Ajouter les champs :
     ```
     title: Mon Premier Livre
     description: Une histoire passionnante
     user_id: 1
     status: draft
     category_id: 1
     bookType_id: 1
     type: NOVEL
     cover: [cliquer sur "File" et sélectionner une image]
     ```