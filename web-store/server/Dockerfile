# Use an official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the server code
COPY . .

# Expose port 4242
EXPOSE 4242

# Start the Node.js server
CMD ["npm", "start"]
