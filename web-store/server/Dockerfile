# Local development image. The g7 deployment builds deploy/g7/Dockerfile
# instead, which is hardened differently because it runs in public.

# Use an official Node.js image as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy the server code
COPY --chown=node:node . .

# Expose port 4242
EXPOSE 4242

# Drop root. The node image ships an unprivileged `node` user, 4242 is an
# unprivileged port, and everything under /app is owned by that user above.
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:4242/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Start the Node.js server
CMD ["npm", "start"]
