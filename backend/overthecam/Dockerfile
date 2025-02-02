FROM openjdk:17-jdk-slim

# 이미지 작성자가 SSAFY임을 나타내는 메타데이터
LABEL authors="SSAFY"

# 환경 변수 정의
ENV MYSQL_DB_URL=""
ENV MYSQL_DB_USERNAME=""
ENV MYSQL_DB_PASSWORD=""
ENV JWT_SECRET=""
ENV OPENVIDU_URL=""
ENV OPENVIDU_SECRET=""

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일을 컨테이너로 복사
COPY build/libs/*.jar app.jar

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]