# 빌드 스테이지
FROM node:22-alpine as build

WORKDIR /app

# npm 업데이트 및 패키지 설치
COPY package*.json ./
RUN npm install -g npm@latest && \
    npm install && \
    npm audit fix --force

# 소스 코드 복사 및 빌드
COPY . .
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]