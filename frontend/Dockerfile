# Multi-stage build: compile the SPA with Node, then serve the static
# output with a lightweight Nginx image (no Node runtime in production).

FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Baked in at BUILD time — Vite inlines env vars into the compiled JS bundle,
# so this must be set before `npm run build`, not at container runtime.
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
