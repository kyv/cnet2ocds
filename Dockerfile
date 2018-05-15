FROM mhart/alpine-node:8
MAINTAINER Kevin Brown <kevin@rindecuentas.org>

ENV NODE_ENV=production
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH "$PATH:/home/node/.npm-global/bin"

RUN apk --no-cache add tini git \
  && addgroup -S node \
  && adduser -S -G node node

WORKDIR /home/node

USER node

COPY package.json .

COPY --chown=node . .

RUN npm install -g .

ENTRYPOINT ["/sbin/tini", "--"]
