# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy public directory first to ensure UI assets are available
COPY public/ ./public/

# Copy the rest of the source code
COPY . .

# Debug: Check what's in the public directory
RUN echo "=== Checking public directory ===" && \
    ls -la public/ && \
    echo "=== Checking if public/UI exists ===" && \
    ls -la public/UI/ || echo "public/UI directory not found!"

# Build the application
RUN npm run build

# Copy UI assets from public/UI to dist/UI (root level)
RUN cp -r public/UI dist/

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 