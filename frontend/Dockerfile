FROM node:22-alpine

WORKDIR /app

# Copy the React app
COPY distributor-web/ ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]