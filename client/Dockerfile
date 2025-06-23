# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy the entire source code
COPY . .

# Debug: Check what's in the public directory
RUN echo "=== Checking public directory ===" && \
    ls -la public/ && \
    echo "=== Checking if public/UI exists ===" && \
    ls -la public/UI/ | head -5

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy UI assets from build stage to nginx html directory
COPY --from=build /app/public/UI /usr/share/nginx/html/UI

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 