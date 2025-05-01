FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install yarn

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]