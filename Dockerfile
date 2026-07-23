# ================================
# ETAPA 1: Build
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero (cache layer)
COPY package*.json ./
RUN npm install

# Copiar todo el proyecto
COPY . .

# Construir la app para producción
RUN npm run build

# ================================
# ETAPA 2: Servidor Nginx
# ================================
FROM nginx:alpine

# Copiar el build de Vite al servidor nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx para Vue Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
