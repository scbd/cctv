# Build stage: needs git, because the @bower_components/* dependencies resolve
# from GitHub URLs rather than the npm registry.
FROM node:20.11-alpine AS build

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY package.json yarn.lock .npmrc ./

RUN yarn install

COPY . ./

# Build, then prune devDependencies so node_modules can be copied as-is into the
# runtime stage. The @bower_components are runtime deps: server.js serves them at
# /app/libs.
RUN yarn run build && \
    yarn install --production && \
    yarn cache clean

# Runtime stage: no git, no build toolchain, no devDependencies.
FROM node:20.11-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8000

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist         ./dist
COPY --from=build /usr/src/app/app          ./app
COPY --from=build /usr/src/app/package.json /usr/src/app/server.js ./

USER node

EXPOSE 8000

CMD ["node", "server.js"]
