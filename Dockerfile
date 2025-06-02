# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install dependencies for production
RUN npm ci --only=production

# Bundle app source
COPY . .

# Make port 3001 available to the world outside this container
# Platforms like Fly.io or Render will often override this with their own PORT env var.
EXPOSE 3001

# Define environment variable for the port, defaulting to 3001 if not set by the platform
ENV PORT=3001

# Run server.js when the container launches
CMD [ "node", "server.js" ]
