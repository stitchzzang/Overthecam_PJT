FROM openjdk:17-jdk-slim
LABEL authors="SSAFY"

WORKDIR /app
COPY build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]