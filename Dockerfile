FROM node:18.16.0-alpine3.16

WORKDIR /app

COPY package.json .

RUN yarn

COPY . .

EXPOSE 8000

CMD ["yarn", "start"]
