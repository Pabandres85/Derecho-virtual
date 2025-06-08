# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependencias necesarias para compilación
RUN apk add --no-cache libc6-compat

# Copiar archivos de dependencias
COPY package.json ./

# Instalar dependencias
RUN npm install

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para la compilación
ENV NODE_ENV=production

# Construir la aplicación
RUN npm run build

# Stage 3: Runner
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Eliminar archivos por defecto de nginx
RUN rm -rf ./*

# Copiar archivos construidos
COPY --from=builder /app/dist .

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"] 