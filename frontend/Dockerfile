# etapa 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/ .
# --- capta o ARG vindo do compose ---
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
# grava num arquivo que o Vite lê
RUN echo "VITE_API_BASE=$VITE_API_BASE" > .env \
 && npm ci \
 && npm run build

# etapa 2: nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
