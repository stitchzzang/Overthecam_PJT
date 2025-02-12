import React from "react";

const ExactDesign = () => {
  return (
    <div className="w-full h-full items-center bg-white overflow-hidden">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          {/* 파란색 그라데이션 - 약간 더 연하게 */}
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#D0E8FF", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#E2F0FF", stopOpacity: 0.9 }} />
          </linearGradient>

          {/* 분홍색 그라데이션 - 약간 더 연하게 */}
          <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FFD1DA", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#FFE2E7", stopOpacity: 0.9 }} />
          </linearGradient>

          {/* 회색 그라데이션 - 약간 더 연하게 */}
          <linearGradient id="grayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#ECECEC", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#F4F4F4", stopOpacity: 0.9 }} />
          </linearGradient>

          {/* 그림자 필터 추가 */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 작은 블롭들을 위한 더 진한 그라데이션 추가 */}
          <linearGradient id="deeperBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#B8DCFF", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#D4E9FF", stopOpacity: 0.9 }} />
          </linearGradient>

          <linearGradient id="deeperPinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FFBFCC", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#FFD6DE", stopOpacity: 0.9 }} />
          </linearGradient>

          <linearGradient id="deeperGrayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#E5E5E5", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#EEEEEE", stopOpacity: 0.9 }} />
          </linearGradient>

          {/* 이너 쉐도우 필터 추가 */}
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feOffset dx="0" dy="4" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
            <feFlood floodColor="#000000" floodOpacity="0.15"/>
            <feComposite in2="shadowDiff" operator="in"/>
            <feComposite in2="SourceGraphic" operator="over" result="firstfilter"/>
            <feGaussianBlur in="firstfilter" stdDeviation="1" />
          </filter>

          {/* 기존 외부 쉐도우와 이너 쉐도우 결합 */}
          <filter id="combinedShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
            <feFlood floodColor="#000000" floodOpacity="0.15"/>
            <feComposite in2="shadowDiff" operator="in"/>
            <feComposite in2="SourceGraphic" operator="over"/>
            <feGaussianBlur stdDeviation="1"/>
          </filter>

          {/* 작은 블롭용 부드러운 그라데이션 - 약간 더 연하게 */}
          <linearGradient id="softBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#B8DCFF", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#D0E8FF", stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: "#E2F0FF", stopOpacity: 0.8 }} />
          </linearGradient>

          <linearGradient id="softPinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FFC8D3", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#FFD1DA", stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: "#FFE2E7", stopOpacity: 0.8 }} />
          </linearGradient>

          <linearGradient id="softGrayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#E5E5E5", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#ECECEC", stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: "#F4F4F4", stopOpacity: 0.8 }} />
          </linearGradient>

          {/* 향상된 그림자 효과 - 작은 블롭용 */}
          <filter id="enhancedShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
            <feFlood floodColor="#000000" floodOpacity="0.2"/>
            <feComposite in2="shadowDiff" operator="in"/>
            <feComposite in2="SourceGraphic" operator="over"/>
            <feGaussianBlur stdDeviation="1"/>
          </filter>

          <style>
            {`
              @keyframes gentleFloat {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(0, -15px); }
              }

              @keyframes gentleWave {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(-8px, -8px) scale(1.03); }
              }

              @keyframes gentlePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
              }

              .float-blob {
                animation: gentleFloat 4s ease-in-out infinite;
              }

              .wave-blob {
                animation: gentleWave 5s ease-in-out infinite;
              }

              .pulse-blob {
                animation: gentlePulse 6s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* 왼쪽 상단 파란색 블롭의 그림자 효과 - 완전히 새로운 울퉁불퉁 형태 */}
        <path
          d="M-160 -90 
             C-120 -140, -60 -150, 0 -130
             Q60 -110, 120 -80
             C180 -50, 240 -30, 260 20
             Q280 70, 270 120
             C260 170, 230 190, 190 200
             Q150 210, 90 190
             C30 170, -20 150, -60 120
             Q-100 90, -130 50
             C-160 10, -180 -20, -190 -50
             Q-200 -80, -180 -100
             C-160 -120, -140 -110, -160 -90
             Q-180 -70, -160 -90"
          fill="url(#blueGradient)"
          filter="url(#combinedShadow)"
          style={{ opacity: 0.4, animation: "gentleFloat 6s ease-in-out infinite" }}
          transform="scale(1.15) translate(10, -20)"
        />

        {/* 왼쪽 상단 파란색 블롭 - 기존 블롭 */}
        <path
          d="M-150 -100 
             C-80 -150, 100 -100, 180 -50
             Q250 0, 270 80
             C290 160, 200 200, 100 180
             Q0 160, -50 100
             C-100 40, -200 -50, -150 -100"
          fill="url(#blueGradient)"
          filter="url(#combinedShadow)"
        />

        {/* 오른쪽 분홍색 블롭의 그림자 효과 - 더욱 울퉁불퉁한 형태 */}
        <path
          d="M510 220
             C430 140, 380 170, 350 210
             Q300 235, 270 270
             C250 300, 230 350, 260 390
             Q290 430, 340 445
             C390 460, 440 430, 470 390
             Q500 350, 530 310
             C560 270, 570 260, 550 240
             Q530 220, 510 220"
          fill="url(#pinkGradient)"
          filter="url(#combinedShadow)"
          style={{ opacity: 0.4, animation: "gentleFloat 6s ease-in-out infinite" }}
          transform="scale(1.15) translate(-40, -25)"
        />

        {/* 오른쪽 분홍색 블롭 - 더 유기적인 형태 */}
        <path
          d="M500 200
             C450 150, 400 180, 350 200
             Q300 220, 280 260
             C250 320, 270 380, 320 400
             Q370 420, 420 380
             C470 340, 530 250, 500 200"
          fill="url(#pinkGradient)"
          filter="url(#combinedShadow)"
        />

        {/* 오른쪽 상단의 회색 블롭 - 우측으로 이동 */}
        <path
          d="M240 40
             C270 25, 300 40, 308 60
             Q315 80, 300 100
             C285 120, 255 115, 240 100
             Q225 85, 222 70
             C219 55, 225 45, 240 40"
          fill="url(#softGrayGradient)"
          filter="url(#enhancedShadow)"
          transform="rotate(-45, 270, 90) scale(0.85) translate(50, 10)"
          style={{ animation: "gentleWave 5s ease-in-out infinite" }}
        />

        {/* 왼쪽 중앙의 분홍색 블롭 - 더 세련된 비정형 */}
        <path
          d="M40 160
             C70 130, 95 135, 115 150
             Q140 165, 145 185
             C150 205, 140 225, 120 235
             Q90 245, 70 225
             C50 205, 30 190, 25 175
             Q20 160, 40 160"
          fill="url(#softPinkGradient)"
          filter="url(#enhancedShadow)"
          transform="rotate(15, 80, 190)"
          style={{ animation: "gentleWave 5s ease-in-out infinite" }}
        />

        {/* 왼쪽 하단 회색 블롭 - 더 자연스러운 곡선 */}
        <path
          d="M-80 450
             C-120 400, -60 350, 0 320
             Q60 290, 120 300
             C180 310, 220 360, 200 400
             Q180 440, 120 450
             C60 460, -40 500, -80 450"
          fill="url(#deeperGrayGradient)"
          filter="url(#combinedShadow)"
        />

        {/* 오른쪽 하단의 파란색 블롭 - 위치 조정 */}
        <path
          d="M180 280
             C220 270, 235 260, 255 270
             C275 280, 285 295, 290 310
             C295 325, 285 335, 270 345
             C255 355, 235 350, 220 340
             C205 330, 195 325, 185 315
             C175 305, 170 290, 175 285
             C180 280, 185 275, 180 280"
          fill="url(#softBlueGradient)"
          filter="url(#enhancedShadow)"
          transform="rotate(-15, 220, 310) scale(1.1) translate(0, -30)"
        />
      </svg>
    </div>
  );
};

export default ExactDesign;
