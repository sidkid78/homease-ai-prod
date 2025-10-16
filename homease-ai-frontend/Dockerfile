# Stage 1: Builder - Install dependencies and build the application
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables if needed (e.g., from Cloud Build)
# ARG NEXT_PUBLIC_FIREBASE_API_KEY
# ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY

# Build the Next.js application
RUN npm run build

# ---

# Stage 2: Runner - Create the final, lean production image
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy the static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the user to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the default port for Next.js
ENV PORT 3000

# Start the Next.js server
CMD ["node", "server.js"]
