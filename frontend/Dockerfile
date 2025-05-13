# etapa 1 – build
FROM node:20-slim AS builder
WORKDIR /app
COPY frontend/ .

ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

# 1) instala deps determinísticas
RUN npm ci

# 2) instala o binário opcional que o npm pulou
RUN npm i --no-save @rollup/rollup-linux-x64-gnu

# 3) build do app
RUN npm run build

# etapa 2 – nginx (igual)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
