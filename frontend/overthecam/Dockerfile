FROM node:22 as build

ARG VITE_BASE_URL
ARG VITE_LIVEKIT_URL

ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_LIVEKIT_URL=${VITE_LIVEKIT_URL} 

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /var/www/html
COPY nginx.conf /etc/nginx/sites-enabled/default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]