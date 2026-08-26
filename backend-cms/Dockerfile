FROM node:24-alpine AS dependencies

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
