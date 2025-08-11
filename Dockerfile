# Server Dockerfile
FROM node:18
WORKDIR /app
COPY codespace/server/package*.json ./
RUN npm install
COPY codespace/server/ .
EXPOSE 5000
CMD ["node", "app.js"]
