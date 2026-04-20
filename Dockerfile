FROM node:22-alpine

RUN apk add --no-cache chromium

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run gen:types
RUN npm run build

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
