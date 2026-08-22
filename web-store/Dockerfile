# DEAD FILE, PENDING DELETION. Nothing in this repository builds it. The only
# reference is web-store/docker-compose.yml, which pulls prebuilt images from
# Docker Hub rather than building, and the workflow that published those images
# was retired in PR #5. The live deployment builds deploy/g7/Dockerfile.
#
#checkov:skip=CKV_DOCKER_3:2026-08-21 nginx:alpine listens on 80 by default, a privileged port, so USER cannot be added without also changing the listen directive in nginx config that this repository does not carry. Adding an untested USER to an image nothing builds would satisfy the scanner while risking a broken image, which is the opposite of the point. Delete the file instead.
#checkov:skip=CKV_DOCKER_2:2026-08-21 same reason. A healthcheck on an image nothing builds and nothing runs is decoration. Delete the file instead.
#
# Also note: node:16 below has been end of life since 2023-09.

# Use an official Node.js image as the base image
FROM node:16 as build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular app
RUN npm run build --prod

# Use a smaller, production-ready image
FROM nginx:alpine

# Copy the built Angular app to the nginx html directory
COPY --from=build /app/dist/* /usr/share/nginx/html/

# Entrypoint generates assets/env.js from the API_URL env var at container startup
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 4200
EXPOSE 4200

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
