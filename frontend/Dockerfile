FROM node:alpine as installer

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install

FROM node:alpine

WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY . .

ARG FRONTEND_ENV=dev
ENV VUE_APP_ENV=${FRONTEND_ENV}
ENV NODE_ENV=development
ENV HOST 0.0.0.0

EXPOSE 3000

CMD ["yarn", "dev"]
