FROM node:18-alpine
RUN apk add --no-cache docker-cli python3 py3-pip
WORKDIR /app
COPY package*.json requirements.txt ./
RUN npm install --production
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
EXPOSE 6909
CMD ["npm","start"]
