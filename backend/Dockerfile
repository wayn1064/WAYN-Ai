FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
# Prisma requires openssl
RUN apk add --no-cache openssl
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Use port 5001 as required by WAYN-Ai ecosystem rules
EXPOSE 5001
ENV PORT=5001

CMD ["npm", "start"]
