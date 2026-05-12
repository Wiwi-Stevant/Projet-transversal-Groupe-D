FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# On compile le TypeScript en JavaScript
RUN npm run build

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]


