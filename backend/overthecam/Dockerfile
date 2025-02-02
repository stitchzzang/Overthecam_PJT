FROM openjdk:17-jdk-slim

# 이미지 작성자가 SSAFY임을 나타내는 메타데이터
LABEL authors="SSAFY"

# 환경 변수 정의
ENV SPRING_PROFILES_ACTIVE=prod

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일을 컨테이너로 복사
COPY build/libs/*.jar app.jar

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]