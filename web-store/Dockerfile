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

# Expose port 4200
EXPOSE 4200

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
