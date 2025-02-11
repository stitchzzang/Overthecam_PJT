import React from "react";

const ExactDesign = () => {
  return (
    <div className="w-full h-full items-center bg-white rounded-tl-lg rounded-bl-lg overflow-hidden shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          {/* Enhanced blue gradient with more saturation and depth */}
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#BAE6FF", stopOpacity: 0.95 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#E1F4FF", stopOpacity: 0.8 }}
            />
          </linearGradient>

          {/* Enhanced pink gradient with more saturation and depth */}
          <linearGradient id="pinkGradient" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: "#FFBAC8", stopOpacity: 0.95 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#FFE1E8", stopOpacity: 0.8 }}
            />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
            <feOffset dx="2" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animation for floating effect for each element */}
          <style>
            {`
              @keyframes floatEffect1 {
                0% {
                  transform: translate(0, 0) rotate(0deg);
                }
                50% {
                  transform: translate(15px, -10px) rotate(10deg);
                }
                100% {
                  transform: translate(0, 0) rotate(0deg);
                }
              }

              @keyframes floatEffect2 {
                0% {
                  transform: translate(0, 0) rotate(0deg);
                }
                50% {
                  transform: translate(-20px, 15px) rotate(-15deg);
                }
                100% {
                  transform: translate(0, 0) rotate(0deg);
                }
              }

              @keyframes floatEffect3 {
                0% {
                  transform: translate(0, 0) rotate(0deg);
                }
                50% {
                  transform: translate(10px, -20px) rotate(5deg);
                }
                100% {
                  transform: translate(0, 0) rotate(0deg);
                }
              }

              @keyframes floatEffect4 {
                0% {
                  transform: translate(0, 0) rotate(0deg);
                }
                50% {
                  transform: translate(-15px, 10px) rotate(8deg);
                }
                100% {
                  transform: translate(0, 0) rotate(0deg);
                }
              }

              @keyframes floatEffect5 {
                0% {
                  transform: translate(0, 0) rotate(0deg);
                }
                50% {
                  transform: translate(12px, -5px) rotate(12deg);
                }
                100% {
                  transform: translate(0, 0) rotate(0deg);
                }
              }

              .floating1 {
                animation: floatEffect1 4s ease-in-out infinite;
              }

              .floating2 {
                animation: floatEffect2 5s ease-in-out infinite;
              }

              .floating3 {
                animation: floatEffect3 6s ease-in-out infinite;
              }

              .floating4 {
                animation: floatEffect4 7s ease-in-out infinite;
              }

              .floating5 {
                animation: floatEffect5 8s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* Larger blue blob with shadow */}
        <path
          d="M-50 -50 C150 0, 250 -30, 300 80 C350 190, 250 220, 150 200 C0 180, -100 100, -50 -50"
          fill="url(#blueGradient)"
          filter="url(#shadow)"
          className="floating1"
        />

        {/* Larger pink blob with shadow */}
        <path
          d="M450 450 C250 400, 150 430, 100 320 C50 210, 150 180, 250 200 C400 220, 500 300, 450 450"
          fill="url(#pinkGradient)"
          filter="url(#shadow)"
          className="floating2"
        />

        {/* Enhanced floating elements with shadows */}
        <circle
          cx="120"
          cy="150"
          r="25"
          fill="#FFBAC8"
          fillOpacity="0.9"
          filter="url(#shadow)"
          className="floating3"
        />

        <circle
          cx="280"
          cy="100"
          r="20"
          fill="#F0F0F0"
          fillOpacity="0.9"
          filter="url(#shadow)"
          className="floating4"
        />

        <circle
          cx="250"
          cy="300"
          r="23"
          fill="#BAE6FF"
          fillOpacity="0.9"
          filter="url(#shadow)"
          className="floating5"
        />
      </svg>
    </div>
  );
};

export default ExactDesign;
