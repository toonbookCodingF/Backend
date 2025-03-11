# Utilisation de l'image officielle Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installer les dépendances du projet (y compris typescript pour la compilation)
RUN npm install

# Copier tout le code source dans le conteneur
COPY . .

# Exécuter la commande de build TypeScript pour compiler le code
RUN npm run build

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application avec Node.js (le code compilé)
CMD ["npm", "start"]
