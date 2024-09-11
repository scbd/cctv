FROM node:20.11-alpine

RUN apk update  -q && \
    apk upgrade -q && \
    apk add     -q --no-cache bash git curl yarn

WORKDIR /usr/src/app

COPY package.json yarn.lock .npmrc ./

RUN yarn install

COPY . ./

RUN yarn  run build

ENV PORT 8000

EXPOSE 8000

CMD ["node", "server.js"]
