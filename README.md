# YES204 팀의 "캠건너 불구경" 서비스 입니다.

<div align="center">
  <img src="/uploads/8e1822113513723c7b5e8d90efb915b1/Logo2.png" alt="logo" width=30%>
</div>


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

- [🔥 캠건너 불구경 서비스 소개](#캠건너-불구경-서비스-소개)
- [⏰ 개발 기간](#-개발-기간)
- [💡 기획 배경](#-기획-배경)
- [🎯 목표 및 주요 기능](#-목표-및-주요-기능)
- [🔧 기능 소개](#-기능-소개)
- [📢 기술 스택 소개](#-기술-스택-소개)
- [🔍 시스템 아키텍처](#-시스템-아키텍처)
- [💾 ERD 다이어그램](#-erd-다이어그램)
- [👥 팀 소개 및 역할](#-team-yes204)


---


## ⏰ 개발 기간
2025.01.06~2025.01.26 (3주) 기획, 설계

2025.01.27~2025.02.21 (4주) 개발

## 💡 기획 배경
누구나 살아가면서 주변 사람들과 논쟁을 하게 됩니다. 가벼운 밸런스 게임부터 인간관계에서 부딪히는 문제까지, 사람들은 서로 다른 의견을 주장하며 상대를 설득하려 합니다.

하지만 의견 조율이 되지 않고, 오랜 시간 논쟁을 진행할 때도 있습니다. 이런 경우 제삼자의 의견을 통해서 서로의 입장을 조율 하기도 합니다.

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

- 서비스의 핵심 가치와 사용법을 애니메이션으로 소개하여 신규 사용자의 이해도 향상

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EC%98%A8%EB%B3%B4%EB%94%A9+%ED%99%94%EB%A9%B4%EB%85%B9%ED%99%94+%EC%B5%9C%EC%A2%85.gif)

### ✅ **회원가입**

- 간편한 회원가입 절차로 빠르게 서비스에 참여 가능능

![images](/uploads/112ec50062cf444ae999d10ca61f32dc/회원가입__1_.gif)

### ✅ **홈 화면**  

- 인기 있는 투표와 실시간 논쟁 배틀방을 한눈에 볼 수 있는 대시보드 형태의 메인화면

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EB%A9%94%EC%9D%B8%ED%99%94%EB%A9%B4+%ED%88%AC%ED%91%9C%2C+%EB%B0%B0%ED%8B%80.gif)

### ✅ **커뮤니티 투표**

- 다양한 주제에 대한 실시간 투표 참여와 결과 시각화, 댓글 기능을 통한 활발한 의견 교환

![images](/uploads/3e6ab1956eaa1806fec86052d580b57f/투표_-_Clipchamp로_제작.gif)

### 👑 **배틀방에서 투표 생성 (방장 모드)** 

- 논쟁 중 즉각적인 청중 반응을 확인할 수 있는 실시간 투표 시스템 생성

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EB%B0%B0%ED%8B%80_%ED%88%AC%ED%91%9C+%EC%83%9D%EC%84%B1.gif)

### ✅ **배틀 (참가자 모드)**  

- WebRTC 기반 화상 논쟁 플랫폼으로 실시간 발화 분석과 청중 투표를 통한 객관적 승패 판정

### ✅ **사전 배틀방**  

![사전_배틀방](/uploads/3629f197b6cb97b2a207024ad4ce89bc/사전_배틀방.gif)

### ✅ **배틀 진행**  

![메인_배틀](/uploads/0a9f9f7ee0e4c77f36df7a2761b0986f/메인_배틀.gif)

### ✅ **승패 판정 및 실시간 발화분석 리포트**  

![제목_없음__2_](/uploads/dc99dc1f06646d0ae1ed3735dbded770/제목_없음__2_.gif)

![발분리](/uploads/27c0498f134c081466ac00f7444bd732/발분리.gif)

### ✅ **욕설 필터링**

![채팅_욕설_필터링__1_](/uploads/a0e57852ac60c27cd3b130daa1127043/채팅_욕설_필터링__1_.gif)


### ✅ **검색 및 팔로우 기능**

- 키워드 기반으로 배틀방, 투표, 사용자를 통합 검색하여 원하는 콘텐츠에 빠르게 접근 가능

- 관심 있는 사용자를 팔로우하여 지속적으로 활동을 확인할 수 있는 소셜 네트워크 기능

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EA%B2%80%EC%83%89%EA%B3%BC+%ED%8C%94%EB%A1%9C%EC%9A%B0+%EC%98%81%EC%83%81%EB%85%B9%ED%99%94+%EC%B5%9C%EC%A2%85.gif)

### ✅ **상점**

- 배틀에서 획득한 포인트로 프로필 아이템과 배틀 효과를 구매할 수 있는 인게임 상점

![images](https://d26tym50939cjl.cloudfront.net/uploads/%EC%83%81%EC%A0%90.gif)

### ✅ **마이페이지**

- 개인 배틀 전적, 참여 내역, 팔로워 관리 및 맞춤형 발화 분석 리포트를 제공하는 사용자 대시보드

![마이페이지_발분리__배틀__투표_조회](/uploads/6425a86eba6c2c8c80ec8f91d429cede/마이페이지_발분리__배틀__투표_조회.gif)


---

<br>

## 📌 기술 스택 소개

### OpenVidu

OpenVidu는 WebRTC 기술을 기반으로 실시간 애플리케이션을 구현할 수 있는 플랫폼입니다. 

OpenVidu 아키텍쳐는 아래와 같습니다.

<div align="center">
  <img src="https://d26tym50939cjl.cloudfront.net/uploads/%EC%98%A4%ED%94%88%EB%B9%84%EB%91%90.png" alt="openvidu" width=70%>
</div>

실시간 미디어 스트리밍 인프라와 클라이언트, 서버로 구성됩니다.

우리 서비스는 WebRTC 기술을 직접 구현하지 않고, Openvidu 플랫폼을을 커스텀하여 배틀방 기능을 구현했습니다.

<br>

### **📢 Tech Stack**  

#### **Frontend**  
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

#### **Backend**  
![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Spring WebSocket](https://img.shields.io/badge/Spring_WebSocket-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Spring Cloud AWS](https://img.shields.io/badge/Spring_Cloud_AWS-6DB33F?style=for-the-badge&logo=spring&logoColor=white)

#### **Build & Deployment**  
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)

#### **Database & Cache**  
![MySQL](https://img.shields.io/badge/MySQL_8.0.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

#### **Infrastructure**  
![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)

---

<br>


## **🔍 시스템 아키텍처**  
<div align="center">
  <img src="/uploads/34c19640155cef1083f4d5615317336e/image.png" alt="architecture" width=80%>
</div>

## **💾 ERD Diagram**  
<div align="center">
  <img src="/uploads/c5052d4a7336c62f6c5fc97c34ac1f6b/image.png" alt="diagram" width=80%>
</div>

---

<br>

## **👥 Team YES204**  

팀 YES204는 프론트엔드 3명, 백엔드 3명으로 구성된 팀입니다!

# YES204 팀의 "캠건너 불구경" 서비스 입니다.

<img src="/uploads/7d55d722e32e58ec5fac7c7343308e69/image.png" alt="diagram" width=70%>

| 👑Frontend | Frontend | Frontend | 👑Backend | Backend | Backend |
|----------|----------|----------|----------|----------|----------|
| [순화](https://github.com/SunaS2) (팀장) | [해인](https://github.com/stitchzzang) | [민수](https://github.com/parkminsu6421) | [수진](https://github.com/ssuzyn) (팀장) | [수비](https://github.com/SubiHwang) | [예지](https://github.com/ygjeong5) |

<br>

## 👥 팀원 별 역할

### FrontEnd Developer

#### 🧑‍💻 순화 - 프론트 팀장

- OpenVidu 3, Stomp & SockJS 활용 실시간 화상 논쟁 배틀방 구현
- 발화 분석 리포트를 위한 React Speech Recognition 기반 STT 구현
- 상점 시스템 구현
- 사용자 경험 최적화를 위한 UI/UX 설계 및 개발

#### 🧑‍💻 해인

- Figma를 활용한 프로토타입 제작, 로고 및 테마 컬러 선정
- 온보딩 / 메인 페이지 - Framer Motion 애니메이션 적용 및 이미지 프리로딩 최적화
- 커뮤니티 투표 - 투표 및 댓글 CRUD 기능, 실시간 투표 시각화(Progress Bar, Confetti)
- 검색 페이지 - 멀티 엔드포인트 통합 검색 및 Zustand 상태 관리 구현
- 배틀 방 랜덤 주제 생성기 구현 - 슬롯 머신 효과 및 keyframes 애니메이션 구현
- 회원가입, 로그인, 배틀/투표 생성 폼 - SVG 그래피킹 및 CSS 애니메이션 적용

#### 🧑‍💻 민수

- 사용자 인증 시스템 (로그인, 회원가입, 정보 관리) 구현
- 마이페이지 탭 UI 및 팔로워/팔로잉 실시간 업데이트
- 발화 리포트 및 감정 분석 결과 시각화
- 상점 시스템 및 인벤토리 관리 구현

### BackEnd Developer

#### 🧑‍💻 수진 - 백엔드 팀장

- 배틀방 투표/정산 시스템 구현 (Redis 락 기반 동시성 제어)
- 실시간 논쟁 배틀방 통신 시스템 설계 (WebSocket+STOMP 프로토콜)
- 비속어 필터링 시스템 개발 (Aho-Corasick 알고리즘)
- 사용자 팔로우 기능 및 통계 시스템 개발
- 토큰 관리 및 다중 로그인 제한 시스템 개발 (Redis 기반 세션 관리 및 블랙리스트 적용)

#### 🧑‍💻 수비

- Docker, Jenkins CI/CD, AWS EC2, Nginx를 활용한 통합 인프라 구축
- OpenVidu 프레임워크 기반 실시간 배틀방 구현
- BERT 모델 활용 실시간 발화 분석 시스템 구축
- AWS S3와 CloudFront CDN 연동 이미지 관리 시스템 구현

#### 🧑‍💻 예지

- JWT 기반 로그인 및 로그아웃 구현
- AI 허브 감정 태깅 데이터셋 활용한 5만여 개 학습 데이터 전처리
- BERT 모델 기반 화상 토론 실시간 감정 분석 시스템 구축
- 커뮤니티 투표 CRUD 구현
