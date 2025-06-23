# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy the entire source code
COPY . .

# Build the application
RUN npm run build

# Create UI directory in dist and copy assets (with fallback)
RUN mkdir -p dist/UI && \
if [ -d "public/UI" ]; then \
cp -r public/UI/* dist/UI/; \
else \
echo "public/UI not found, creating empty UI directory"; \
touch dist/UI/.placeholder; \
fi

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