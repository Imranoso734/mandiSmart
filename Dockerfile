FROM alpine:3.23

RUN apk add --no-cache chromium nodejs-current npm

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm ci

COPY ./ ./
RUN npm run gen:types
RUN npm run build

ENV NODE_ENV=production

CMD ["npm", "run", "start:prod"]
EXPOSE 5000
