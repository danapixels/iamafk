FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directory for persistent data
RUN mkdir -p /app/data

# Expose port 3001
EXPOSE 3001

# Start the server
CMD ["node", "server.js"] 