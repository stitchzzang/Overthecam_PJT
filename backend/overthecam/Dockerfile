FROM openjdk:17-jdk-slim
LABEL authors="SSAFY"

WORKDIR /app

COPY build/libs/*.jar app.jar

# jenkins 파일의 포트 설정과 일치시켜야한다.
EXPOSE 18080

ENTRYPOINT ["java", "-jar", "app.jar"]