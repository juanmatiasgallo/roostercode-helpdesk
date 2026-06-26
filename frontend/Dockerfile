# --- Etapa 1: build de Next.js ---
FROM node:20-alpine AS build
WORKDIR /app
# El contexto de build en EasyPanel es la raíz del repo, por eso copiamos frontend/
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# NEXT_PUBLIC_API_URL debe estar disponible en el build (Next la "hornea" en el bundle).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# --- Etapa 2: correr ---
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
