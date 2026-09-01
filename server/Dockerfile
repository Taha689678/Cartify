# Use Node.js 20 LTS Alpine image for a smaller container footprint
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies for a leaner image
RUN npm ci --only=production

# Copy the remaining backend source code
COPY . .

# Back4app sets the PORT environment variable, usually 3000, 5000, or 8080.
# We'll expose 5000 as a standard default matching the app's local fallback.
EXPOSE 5000

# Start the application using the existing production start script
CMD ["npm", "start"]
