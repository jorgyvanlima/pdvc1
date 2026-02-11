FROM node:20-alpine

WORKDIR /app

# Install build tools and OpenSSL for Prisma
RUN apk add --no-cache python3 make g++ openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY .env.example .env

# Install dependencies
RUN npm install

# Copy source code
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start production server
CMD ["npm", "start"]
