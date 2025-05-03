FROM node:23-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN rm -rf node_modules package-lock.json

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "3000"]