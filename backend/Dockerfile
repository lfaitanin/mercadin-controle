FROM node:20-slim 

WORKDIR /app

# 1) OpenSSL → evita o erro do Prisma
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# 2) dependências node
COPY package*.json ./
RUN npm install

# 3) código-fonte
COPY . .

# 4) gerar cliente Prisma
RUN npx prisma generate

EXPOSE 3000
CMD ["sh","-c","npx prisma migrate deploy && node src/index.js"]