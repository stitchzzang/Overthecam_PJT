FROM openjdk:17-jdk-slim
LABEL authors="SSAFY"

WORKDIR /app
COPY build/libs/*.jar app.jar

#jenkins의 port와 일치시켜야 한다.
EXPOSE 18080
ENTRYPOINT ["java", "-jar", "app.jar"]