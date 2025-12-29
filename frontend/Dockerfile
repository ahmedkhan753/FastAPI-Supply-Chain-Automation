FROM node:18-alpine

WORKDIR /app

# Copy the React app
COPY client/ ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]