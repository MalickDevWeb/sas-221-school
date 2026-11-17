# Construction (2026-11-13, carte APP-SEC-07P) : Node 22 comme l'intégration continue (Vite 7 exige Node ≥ 20.19),
# installation reproductible depuis package-lock.json (npm ci, et non npm install).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx vite build

# Service : nginx SANS privilèges root (utilisateur nginx, uid 101), port non privilégié 8080.
# Avant : nginx:alpine exécuté en root sur le port 80.
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Configuration pour application monopage + en-têtes de sécurité (APP-SEC-07)
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER 101
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
