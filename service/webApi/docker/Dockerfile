FROM node:20-slim

WORKDIR /app

RUN apt update -y
# RUN apt install -y jq curl

COPY ./service/webApi/src/package.json /app/

RUN yarn install

COPY ./service/webApi/src /app

