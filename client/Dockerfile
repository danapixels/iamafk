# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy the entire source code (including public/UI)
COPY . .

# Debug: Check what's in the public directory
RUN echo "=== Checking public directory ===" && \
ls -la public/ && \
echo "=== Checking if public/UI exists ===" && \
ls -la public/UI/ || echo "public/UI directory not found!"

# Build the application
RUN npm run build

# Debug: Check what's in dist after build
RUN echo "=== Checking dist directory after build ===" && \
ls -la dist/

# Copy UI assets from public/UI to dist/UI (root level)
RUN echo "=== Copying UI assets ===" && \
cp -rv public/UI dist/ && \
echo "=== UI assets copied ===" && \
ls -la dist/UI/ | head -10

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Debug: Check final nginx directory
RUN echo "=== Final nginx directory ===" && \
ls -la /usr/share/nginx/html/ && \
echo "=== UI directory in nginx ===" && \
ls -la /usr/share/nginx/html/UI/ | head -10

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 