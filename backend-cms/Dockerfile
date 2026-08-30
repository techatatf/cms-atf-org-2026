FROM node:24-alpine AS dependencies

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches
RUN npm ci

FROM dependencies AS development

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]

FROM dependencies AS production

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

EXPOSE 3001

CMD ["sh", "./docker-entrypoint.sh"]
