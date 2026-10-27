# syntax=docker/dockerfile:1
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
ARG PUBLIC_PATH=/
ENV PUBLIC_PATH=$PUBLIC_PATH
ARG NODE_OPTIONS=--max-old-space-size=4096
RUN NODE_OPTIONS="$NODE_OPTIONS" npm run build

FROM nginx:alpine-slim AS final
ARG PUBLIC_PATH=/
ENV PUBLIC_PATH=$PUBLIC_PATH
RUN rm -f /etc/nginx/conf.d/default.conf
COPY cfg/template_cfg.conf /etc/nginx/conf.d/template_cfg.conf
COPY --from=build /usr/src/app/build /opt/msp/project-name${PUBLIC_PATH}/
COPY entrypoint.sh /opt/msp/project-name${PUBLIC_PATH}/entrypoint.sh
RUN chmod +x "/opt/msp/project-name${PUBLIC_PATH}/entrypoint.sh"
EXPOSE 8001
ENTRYPOINT ["sh", "-c", "exec \"/opt/msp/project-name${PUBLIC_PATH}/entrypoint.sh\""]
