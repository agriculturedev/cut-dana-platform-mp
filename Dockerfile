# Create container for building mobility-frontend
FROM node:16.13.2-alpine as build

RUN mkdir -p /usr/app
WORKDIR /usr/app

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

COPY . ./masterportal

RUN npm i --prefix masterportal/addons/dipasAddons/dataNarrator
RUN npm i --prefix masterportal/story-backend
RUN npm i --prefix masterportal

RUN npm run buildPortal --prefix masterportal

# Create container for running mobility-frontend
FROM nginx

# Copy build files from build container
COPY --from=build /usr/app/masterportal/dist /usr/share/nginx/html

EXPOSE 80
