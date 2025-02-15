import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

// 스크롤바 숨기는 전역 스타일 추가
const globalStyles = `
  body {
    margin: 0;
    overflow: hidden;
  }
  
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }
`;

const Section = ({ children, className, backgroundImage }) => {
  const [bgStyle, setBgStyle] = useState({
    backgroundImage: backgroundImage ? 
      `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImage})` : 
      'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    willChange: 'transform',
    transform: 'translateZ(0)',
  });

  return (
    <div 
      className={`h-screen flex items-center justify-center snap-start ${className}`}
      style={bgStyle}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-8">{children}</div>
    </div>
  );
};

const FakeMainPage = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  
  useEffect(() => {
    // 이미지 프리로딩
    const preloadImages = async () => {
      const images = [
        '../images/Desktop_mockup.png',
        '../images/Desktop_mockup2.png',
        '../images/Desktop_mockup3.png'
      ];

      const preloadImage = (src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.src = src;
          
          // 브라우저 캐싱 활용
          img.style.display = 'none';
          document.body.appendChild(img);
          setTimeout(() => document.body.removeChild(img), 0);
        });
      };

      try {
        await Promise.all(images.map(preloadImage));
      } catch (error) {
        console.error('Image preloading failed:', error);
      }
    };

    preloadImages();

    // 스타일 태그 추가
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles + `
      .bg-image {
        background-size: cover;
        background-position: center;
        transition: opacity 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(styleSheet);

    // 스크롤 최적화
    const container = scrollContainerRef.current;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ticking = false;
        });
        ticking = true;
      }
    };

    container?.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.head.removeChild(styleSheet);
      container?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 이미지 컴포넌트 최적화
  const OptimizedImage = ({ src, alt, className, ...props }) => (
    <motion.img
      src={src}
      alt={alt}
      className={`${className} loading="eager" decoding="async"`}
      style={{
        willChange: 'transform, opacity',
        transform: 'translateZ(0)'
      }}
      {...props}
    />
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800">
      <div 
        ref={scrollContainerRef}
        className="absolute inset-0 snap-y snap-mandatory overflow-y-scroll hide-scrollbar"
      >
        {/* 첫 번째 섹션 */}
        <Section>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.1, rotate: -180 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              viewport={{ once: true, margin: "-20%" }}
              className="text-center text-white md:w-1/2"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 whitespace-nowrap">
                논쟁은 예술이다
              </h1>
              <p className="text-2xl text-gray-300">
                승패에 쿨하게 승복하실 분들<br />언제나 환영합니다!
              </p>
            </motion.div>
            <OptimizedImage
              src="../images/Desktop_mockup.png"
              alt="논쟁 아이콘"
              className="w-96 h-96 object-contain md:w-2/3"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </Section>

        {/* 두 번째 섹션 */}
        <Section>
          <div className="flex flex-col md:flex-row items-center gap-8 -ml-8">
            <OptimizedImage
              src="../images/Desktop_mockup2.png"
              alt="실시간 배틀"
              className="w-[32rem] h-[32rem] object-contain md:w-2/3"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            />
            <motion.div className="space-y-8 text-white md:w-2/3 px-0">
              <motion.h2 
                initial={{ x: 200 }}
                whileInView={{ x: 0 }}
                transition={{ 
                  delay: 0.3,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                className="text-5xl font-bold text-cusRed-light whitespace-normal leading-tight"
              >
                실시간 논쟁 배틀,<br />지금 시작됩니다!
              </motion.h2>
              <ul className="space-y-4 text-xl whitespace-normal">
                <motion.li
                  initial={{ x: -100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ 
                    delay: 0.6,
                    duration: 1,
                    ease: "easeInOut"
                  }}
                >
                  2명의 배틀러, 최대 4명의 관전자
                </motion.li>
                <motion.li
                  initial={{ x: -100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ 
                    delay: 0.8,
                    duration: 1,
                    ease: "easeInOut"
                  }}
                >
                  AI 기반 욕설 필터링 클린한 채팅 환경
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </Section>

        {/* 세 번째 섹션 */}
        <Section> 
          {/* 배경 이미지 첨부 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            viewport={{ once: true, margin: "-20%" }}
            className="text-center space-y-8 text-white"
          >
            <h2 className="text-5xl font-bold text-cusBlue-light">
              A vs B,<br />당신의 선택은?
            </h2>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.3,
                duration: 1,
                ease: "easeInOut"
              }}
              className="space-y-4 text-xl"
            >
              <p>투표 및 포인트 베팅 참여</p>
              <p>결과에 따라 포인트 획득 가능</p>
            </motion.div>
          </motion.div>
        </Section>

        {/* 네 번째 섹션 - 바운스 효과 */}
        <Section> 
          {/* 배경 이미지 첨부 */}
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring",
              bounce: 0.2,
              duration: 3,
              stiffness: 35
            }}
            viewport={{ once: true, margin: "-20%" }}
            className="space-y-6 text-white"
          >
            <h2 className="text-4xl font-bold text-cusGreen">
              평범한 논쟁은 이제 그만!
            </h2>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-2 text-lg"
            >
              <p>다양한 아이템으로 몰입감을 높이세요!</p>
              <p>상점에서 가면, 프레임, 효과음 등 구매 가능</p>
            </motion.div>
          </motion.div>
        </Section>

        {/* 다섯 번째 섹션 - 스태거 효과 */}
        <Section backgroundImage="../images/Desktop_mockup3.png">
          {/* 배경 이미지 첨부 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 2 }}
            viewport={{ once: true, margin: "-20%" }}
            className="text-center space-y-6 text-white"
          >
            <motion.h2
              initial={{ y: -50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 2 }}
              className="text-4xl font-bold text-cusYellow"
            >
              커뮤니티에서도 다양한 주제로 투표를 즐겨보세요!
            </motion.h2>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 2 }}
              className="space-y-2 text-lg"
            >
              <motion.p
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                실시간 배틀이 아니어도 괜찮습니다!
              </motion.p>
              <motion.p
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                커뮤니티에서 다양한 의견을 나누고 소통해보세요!
              </motion.p>
            </motion.div>
          </motion.div>
        </Section>

        {/* 여섯 번째 섹션 - 화려한 최종 효과 */}
        <Section>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            viewport={{ once: true, margin: "-20%" }}
            className="text-center space-y-10"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="text-6xl font-bold bg-gradient-to-r from-cusRed-light to-cusBlue-light bg-clip-text text-transparent"
            >
              논쟁의 새로운 패러다임,<br />지금 시작해보세요!
            </motion.h2>
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.5,
                duration: 1,
                ease: "easeInOut"
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(255,255,255,0.4)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-gradient-to-r from-cusRed-light to-cusBlue-light rounded-full text-2xl font-bold shadow-lg hover:shadow-2xl transition-all text-white"
              onClick={() => navigate('/main')}
            >
              캠건너불구경 이용하러 가기
            </motion.button>
          </motion.div>
        </Section>
      </div>

      {/* 스크롤 가이드 표시 */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-50">
        <svg 
          className="w-6 h-6 text-white opacity-50" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </div>
  );
};

export default FakeMainPage;
