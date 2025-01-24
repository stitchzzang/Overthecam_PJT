FROM openjdk:17-jdk-slim

#이미지 작성자가 SSAFY임을 나타내는 메타데이터
LABEL authors="SSAFY"

WORKDIR /app
COPY build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]