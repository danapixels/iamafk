# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy the entire source code
COPY . .

# Debug: Check what's in the current directory
RUN echo "=== Checking current directory ===" && \
ls -la && \
echo "=== Checking if public directory exists ===" && \
ls -la public/ 2>/dev/null || echo "public directory not found" && \
echo "=== Checking if public/UI directory exists ===" && \
ls -la public/UI/ 2>/dev/null || echo "public/UI directory not found"

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy UI assets directly from host to nginx html directory
# This ensures the UI assets are available even if they weren't in the build stage
COPY public/UI /usr/share/nginx/html/UI

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 