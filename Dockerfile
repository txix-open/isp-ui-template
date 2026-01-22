ARG NODE_VERSION=lts

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app
FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM deps as build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
ARG PUBLIC_PATH=/
ENV DEV_PUBLIC_PATH=$PUBLIC_PATH
RUN npm run build

FROM nginx:alpine-slim as final
ARG PUBLIC_PATH=/
ENV PUBLIC_PATH=$PUBLIC_PATH

RUN rm -f /etc/nginx/conf.d/default.conf
# ЗАМЕНИТЬ НА конфиг проекта
COPY cfg/template_cfg.conf /etc/nginx/conf.d/template_cfg.conf
# ЗАМЕНИТЬ НА НАЗВАНИЕ ПРОЕКТА
COPY --from=build /usr/src/app/build /opt/msp/project-name${PUBLIC_PATH}/
# ЗАМЕНИТЬ НА НАЗВАНИЕ ПРОЕКТА
COPY entrypoint.sh /opt/msp/project-name${PUBLIC_PATH}/entrypoint.sh
ENTRYPOINT sh -c "/opt/msp/project-name${PUBLIC_PATH}/entrypoint.sh"
