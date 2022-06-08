FROM node:16-alpine
RUN mkdir -p /app
WORKDIR /app
COPY dist .
COPY package.json .
RUN npm install
EXPOSE 3333
CMD ["node", "main.js"]