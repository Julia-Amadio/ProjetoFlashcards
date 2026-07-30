# --- STAGE 1: build ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# O Nginx da imagem final encaminha /api para o backend no Compose.
# O argumento continua configurável para builds destinados a outros ambientes.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# --- STAGE 2: static runtime ---
FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
