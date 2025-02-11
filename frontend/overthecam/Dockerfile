FROM node:20 as build  # 22 대신 20 사용 (현재 LTS 버전)

ARG VITE_BASE_URL
ARG VITE_LIVEKIT_URL

ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_LIVEKIT_URL=${VITE_LIVEKIT_URL}

WORKDIR /app

# package.json과 package-lock.json만 먼저 복사
COPY package*.json ./

# npm 패키지 설치
RUN npm ci

# 나머지 파일들 복사
COPY . .

# React 빌드
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]