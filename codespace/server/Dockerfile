FROM node:18-alpine
RUN apk add --no-cache docker-cli python3 py3-pip
WORKDIR /app
COPY package*.json requirements.txt ./
RUN npm install --production
RUN pip3 install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 6909
CMD ["npm","start"]
