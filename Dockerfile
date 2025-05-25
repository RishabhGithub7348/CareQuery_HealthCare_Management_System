# Stage 1: Build the Next.js app
FROM node:18-bullseye AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Run the app
FROM node:18-bullseye AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy from the builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
