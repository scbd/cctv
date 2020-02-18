FROM node:12.16.0-alpine3.10

RUN apk update  -q && \
    apk upgrade -q && \
    apk add     -q --no-cache bash git curl yarn

WORKDIR /usr/src/app

COPY package.json .npmrc ./

RUN yarn  --silent install  --production

COPY . ./

ENV PORT 8000

EXPOSE 8000

CMD ["node", "server"]
