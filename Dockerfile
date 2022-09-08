# install stage
FROM node:16.3.0-alpine AS module-install-stage

# module install
#set the working directory
WORKDIR /app

#copy the package and package lock files
#from local to container work directory /app
COPY package.json /app/package.json

RUN apk add yarn
RUN NODE_OPTIONS="--max-old-space-size=8192" yarn install --production --ignore-engines

# build stage
FROM node:16.3.0-alpine AS build-stage
COPY --from=module-install-stage /app/node_modules/ /app/node_modules
WORKDIR /app
COPY . .
ENV GENERATE_SOURCEMAP=false
RUN NODE_OPTIONS="--max-old-space-size=8192" yarn build

# serve with nginx stage
FROM nginx:stable-alpine
# Copy config nginx
COPY --from=build-stage /app/nginx/nginx.conf /etc/nginx/nginx.conf
# Copy static assets from builder stage
COPY --from=build-stage /app/build/ /usr/share/nginx/html
# Copy env from build-stage
COPY --from=build-stage /app/.env /usr/share/nginx/html/.env

RUN apk add --update nodejs
RUN apk add --update npm
RUN npm install -g runtime-env-cra@0.2.2

WORKDIR /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "runtime-env-cra && nginx -g \"daemon off;\""]