FROM node:16.18.1-alpine

ENV LANG=C.UTF-8 \
    TZ=Asia/Tokyo

RUN apk update && \
    apk upgrade && \
    apk add git && \
    npm install -g npm@8.19.2 nuxi nuxt3 pm2@latest

ENV HOST 0.0.0.0
