FROM node:18-alpine
RUN apk add --no-cache docker-cli
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 6909
CMD ["npm","start"]
