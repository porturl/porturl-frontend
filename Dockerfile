# =================================================================
# Stage 1: Build the Angular application
# =================================================================
# Use an official Node.js runtime as a parent image.
# Using alpine for a smaller image size.
FROM node:18-alpine AS builder

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application source code into the container.
COPY . .

# Build the application for production.
# The output will be in the /app/dist/your-app-name directory.
# IMPORTANT: Replace 'my-angular-app' with your actual project name from angular.json.
RUN npm run build -- --configuration production

# =================================================================
# Stage 2: Serve the application from an Nginx server
# =================================================================
# Use a lightweight Nginx image.
FROM nginx:1.25-alpine

# Install 'gettext' which provides the 'envsubst' utility.
# This tool is used to substitute environment variables into configuration files.
RUN apk add --no-cache gettext

# Remove the default Nginx configuration file.
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration from your local machine to the container.
# We will create this file in the next steps.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application artifacts from the 'builder' stage.
# IMPORTANT: Replace 'my-angular-app' with your actual project name.
COPY --from=builder /app/dist/my-angular-app /usr/share/nginx/html

# Copy the entrypoint script that will substitute the environment variables at runtime.
# The official Nginx image will automatically execute scripts in this directory.
COPY entrypoint.sh /docker-entrypoint.d/20-envsubst.sh

# Make the entrypoint script executable.
RUN chmod +x /docker-entrypoint.d/20-envsubst.sh

# Expose port 80 to allow traffic to the Nginx server.
EXPOSE 80

# The default Nginx entrypoint will run our script and then start Nginx.
# The command to start Nginx in the foreground.
CMD ["nginx", "-g", "daemon off;"]
