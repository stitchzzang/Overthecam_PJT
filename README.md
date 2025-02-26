# YES204 팀의 "캠건너 불구경" 서비스 입니다.

> **재미에 의한, 재미를 위한.**  
> 실시간 논쟁이 필요한 사람들을 위한 화상 배틀 플랫폼  
>  
> 친구와 의견이 다를 때, 동료와 입장이 갈릴 때,  
> **실시간 화상 배틀 + 투표 & 배팅으로 승자를 가려보세요!**  


🔗 [캠 건너 불구경 바로가기](https://overthecam.site)  
📽 [시연 영상 바로가기](https://youtu.be/7E-xV0dhKd4)  
📝 [회의록 보기](https://romantic-blanket-13b.notion.site/YES-204-OverTheCam-1739cee6017880c89ac1fa8ccee63de8?pvs=4)  

---

## 🗂️ 서비스 둘러보기

- [🔥 캠건너 불구경 서비스 소개](#-캠-건너-불구경-over-the-cam)
- [👥 팀 소개](#-team-yes204)
- [🔧 기능 소개](#-기능-소개)
- [📌 기술 소개](#-기술-소개)
- [📢 기술 스택](#-tech-stack)
- [🔍 시스템 아키텍처](#-시스템-아키텍처)
- [💾 ERD 다이어그램](#-erd-diagram)

---

## **👥 Team YES204**  

![image](https://d26tym50939cjl.cloudfront.net/uploads/제목을-입력해주세요_-001+(2).png)

## ⏰ 개발 기간
2025.01.06~2025.01.26 (3주) 기획, 설계

2025.01.27~2025.02.21 (4주) 개발

## 💡 기획 배경
누구나 살아가면서 주변 사람들과 논쟁을 하게 됩니다. 가벼운 밸런스 게임부터 인간관계에서 부딪히는 문제까지, 사람들은 서로 다른 의견을 주장하며 상대를 설득하려 합니다. 하지만 의견 조율이 되지 않고, 오랜 시간 논쟁을 진행할 때도 있습니다. 이런 경우 제삼자의 의견을 통해서 서로의 입장을 조율 하기도 합니다.
논쟁을 통해 서로 더 가까워지고, 보다 즐겁게 해결하기 위해서 실시간 판정단 시스템이 결합된 화상 채팅 기반 논쟁 배틀 서비스를 기획했습니다.

## 🎯 목표 및 주요 기능

#### 1. 건설적인 토론 문화 형성

- 논쟁의 흐름을 정리하고 감정 분석을 통해 객관적인 피드백을 제공하는 발화 분석 리포트 제공
- 감정적인 충돌을 막고 건강한 토론 문화를 위해서 채팅창 및 투표 커뮤니티에 욕설 필터링 도입


#### 2. 재미있게 논쟁하기

- 판정단도 논쟁에 즐겁게 참여할 수 있도록 투표 시 응원점수 배팅 및 획득 시스템 도입
- 다른 사람들의 생각이 궁금하거나, 가벼운 논쟁을 위한 투표 커뮤니티 도입

## 🔧 기능 소개

서비스의 주요 기능들을 소개합니다.

### ✅ 온보딩

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EC%98%A8%EB%B3%B4%EB%94%A9+%ED%99%94%EB%A9%B4%EB%85%B9%ED%99%94+%EC%B5%9C%EC%A2%85.gif)

### ✅ **회원가입**

![images](https://d26tym50939cjl.cloudfront.net/uploads/%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85.gif)

### ✅ **홈 화면**  

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EB%A9%94%EC%9D%B8%ED%99%94%EB%A9%B4+%ED%88%AC%ED%91%9C%2C+%EB%B0%B0%ED%8B%80.gif)

### ✅ **커뮤니티 투표**

![images](https://d26tym50939cjl.cloudfront.net/uploads/%ED%88%AC%ED%91%9C.gif)

### ✅ **배틀방에서 투표 생성** 

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EB%B0%B0%ED%8B%80_%ED%88%AC%ED%91%9C+%EC%83%9D%EC%84%B1.gif)

### ✅ **배틀**  



### ✅ **배틀방, 투표 맟 사용자 검색**

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EA%B2%80%EC%83%89%EA%B3%BC+%ED%8C%94%EB%A1%9C%EC%9A%B0+%EC%98%81%EC%83%81%EB%85%B9%ED%99%94+%EC%B5%9C%EC%A2%85.gif)

### ✅ **상점**

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EC%83%81%EC%A0%90.gif)

### ✅ **마이페이지**

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80+%ED%8C%94%EB%A1%9C%EC%9A%B0.gif)


---

## 📌 기술 소개  

### OpenVidu

OpenVidu는 WebRTC 기술을 기반으로 실시간 애플리케이션을 구현할 수 있는 플랫폼입니다. 

OpenVidu 아키텍쳐는 아래와 같습니다.

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EC%98%A4%ED%94%88%EB%B9%84%EB%91%90.png)

실시간 미디어 스트리밍 인프라와 클라이언트, 서버로 구성됩니다.

우리 서비스는 WebRTC 기술을 직접 구현하지 않고, Openvidu 플랫폼을을 커스텀하여 배틀방 기능을 구현했습니다.

---

## **📢 Tech Stack**  

### **Frontend**  
- React.js | JavaScript (Vanilla 포함)  
- Socket.io Client | Axios  

### **Backend**  
- Java 17 | Spring Boot 3.2.3  
- Spring Data JPA | Spring WebSocket (STOMP) | Spring Cloud AWS  

### **Build & Deployment**  
- Gradle | npm | Docker | Jenkins  

### **Database & Cache**  
- MySQL 8.0.4 | Redis  

### **Infrastructure**  
- Ubuntu | Docker | Nginx  
- AWS EC2 | S3  

---

## **🔍 시스템 아키텍처**  
![image](/uploads/34c19640155cef1083f4d5615317336e/image.png)  

## **💾 ERD Diagram**  
![image](/uploads/c5052d4a7336c62f6c5fc97c34ac1f6b/image.png)  

---
