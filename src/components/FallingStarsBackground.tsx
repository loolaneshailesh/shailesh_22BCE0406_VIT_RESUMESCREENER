import React, { useEffect } from 'react';

const FallingStarsBackground: React.FC = () => {
  useEffect(() => {
    generateStarsCSS();
  }, []); // Run only once on component mount

  return (
    <div className="stars-container">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
    </div>
  );
};

// This function dynamically generates and injects the CSS needed for the starfield.
function generateStarsCSS() {
    if (document.getElementById('falling-stars-styles')) {
        return; // Styles already injected
    }

    const generateShadows = (n: number) => {
        let shadows = '';
        for(let i = 0; i < n; i++) {
            // Adds a random blur and opacity to each "star" for a glowing/twinkling effect.
            const blur = Math.random() * 1.5;
            const opacity = 0.5 + Math.random() * 0.5;
            const color = `rgba(255, 255, 255, ${opacity})`;
            shadows += `${Math.random() * 2000}px ${Math.random() * 2000}px ${blur}px ${color},`;
        }
        return shadows.slice(0, -1);
    }
    const shadowsSmall = generateShadows(700);
    const shadowsMedium = generateShadows(200);
    const shadowsBig = generateShadows(100);

    const finalCSS = `
    .stars-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      /* New background with layered gradients to simulate glowing nebula clouds */
      background:
        radial-gradient(ellipse at 70% 30%, rgba(14, 116, 144, 0.2) 0%, rgba(14, 116, 144, 0) 40%),
        radial-gradient(ellipse at 20% 80%, rgba(109, 40, 217, 0.15) 0%, rgba(109, 40, 217, 0) 50%),
        radial-gradient(ellipse at 90% 85%, rgba(190, 24, 93, 0.15) 0%, rgba(190, 24, 93, 0) 40%),
        radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
      overflow: hidden;
      z-index: -10;
    }
    
    #stars, #stars2, #stars3 {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
      animation-name: animStar;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    
    #stars:after, #stars2:after, #stars3:after {
      content: " ";
      position: absolute;
      left: 0;
      top: 2000px;
      width: inherit;
      height: inherit;
      background: transparent;
      box-shadow: inherit;
    }
    
    #stars {
      width: 1px;
      height: 1px;
      box-shadow: ${shadowsSmall};
      animation-duration: 50s;
    }
    
    #stars2 {
      width: 2px;
      height: 2px;
      box-shadow: ${shadowsMedium};
      animation-duration: 100s;
    }
    
    #stars3 {
      width: 3px;
      height: 3px;
      box-shadow: ${shadowsBig};
      animation-duration: 150s;
    }

    @keyframes animStar {
      from { transform: translateY(0px); }
      to { transform: translateY(-2000px); }
    }`;

    const style = document.createElement('style');
    style.id = 'falling-stars-styles';
    style.innerHTML = finalCSS;
    document.head.appendChild(style);
}

export default FallingStarsBackground;