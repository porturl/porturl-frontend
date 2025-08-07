# =================================================================
# Stage 1: Build the Angular application
# =================================================================
FROM node:24-alpine AS builder

# Set a default value for the project name
ARG PROJECT_NAME=porturl-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Use the ARG in the build command's output path
RUN npm run build -- --configuration production --output-path=dist/$PROJECT_NAME

# =================================================================
# Stage 2: Serve the application from an Nginx server
# =================================================================
FROM nginx:1.29-alpine

# Use the same ARG from the previous stage
ARG PROJECT_NAME=porturl-frontend

RUN apk add --no-cache gettext
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Use the ARG in the COPY command
COPY --from=builder /app/dist/${PROJECT_NAME}/browser /usr/share/nginx/html

COPY entrypoint.sh /docker-entrypoint.d/20-envsubst.sh
RUN chmod +x /docker-entrypoint.d/20-envsubst.sh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
