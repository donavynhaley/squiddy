FROM node:20-alpine

RUN apk add --no-cache docker-cli

WORKDIR /app
COPY . .
RUN npm install

CMD ["node", "index.js"]
