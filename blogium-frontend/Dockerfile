# Stage 1: Build Angular application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (client-side only)
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist/blogium/browser /usr/share/nginx/html

# Copy index.csr.html as index.html (client-side rendering)
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then \
        cp /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
