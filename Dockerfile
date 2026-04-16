# ETAPA 1: Construcción (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar el proyecto a JavaScript (genera la carpeta /dist)
RUN npm run build

# ETAPA 2: Producción (Run)
FROM node:20-alpine AS runner

WORKDIR /app

# Definir variable de entorno para producción
ENV NODE_ENV=production

# Copiar solo lo necesario de la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalar solo dependencias de producción para que la imagen sea ligera
RUN npm install --omit=dev

# Exponer el puerto que usa NestJS (por defecto 3000)
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["node", "dist/main"]