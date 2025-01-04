# Stage 1: Build React app
FROM node:18-alpine AS builder

WORKDIR /build

COPY frontend /build/frontend
RUN cd /build/frontend && npm install && npm run build

# Stage 2: Final production image
FROM nginx:alpine AS production

WORKDIR /app

# Install Node.js for the backend and PM2 for process management
RUN apk add --no-cache nodejs npm

# Copy built React app from the builder stage
COPY --from=builder /build/frontend/dist /app/frontend

# Copy backend code and install dependencies
COPY backend /app/backend
RUN cd /app/backend && npm install && npm install -g pm2

# Expose only Nginx port
EXPOSE 80

# Command to start Nginx and the backend
CMD ["sh", "-c", "nginx && pm2 start /app/backend/server.js --name backend --no-daemon"]