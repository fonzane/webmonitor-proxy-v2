# FROM node:16-alpine
# RUN mkdir -p /app
# WORKDIR /app
# COPY dist .
# COPY package.json .
# RUN npm install
# EXPOSE 3333
# CMD ["node", "main.js"]

FROM node:16.14.2-slim as build
WORKDIR /app
COPY . .
RUN apt update && apt install python3 make g++ -y && rm -rf /var/cache/apk/*
RUN npm install --force && npm install -g @nestjs/cli
RUN nest build

FROM node:16.14.2-slim
WORKDIR /app
COPY --from=build /app/dist dist
COPY --from=build /app/node_modules node_modules
EXPOSE 3333
CMD ["node", "dist/main.js"]