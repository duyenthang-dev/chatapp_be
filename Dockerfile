FROM node:16
RUN mkdir -p /src/user/app
WORKDIR /src/user/app
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE 5000
CMD ["node", "server.js"]