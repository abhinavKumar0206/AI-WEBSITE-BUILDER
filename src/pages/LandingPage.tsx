// src/pages/LandingPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const navigate = useNavigate();

  const fullText = "Hello Developer...";
  const typingSpeed = 100; // milliseconds per character

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('dotsCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    let animationFrameId: number;

    if (!ctx) return;

    const dots: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    const numDots = 100;
    const maxDistance = 100; // Max distance for lines to connect

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < numDots; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, // very slow movement
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5, // small dots
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numDots; i++) {
        const dot1 = dots[i];

        // Update position
        dot1.x += dot1.vx;
        dot1.y += dot1.vy;

        // Bounce off walls
        if (dot1.x < 0 || dot1.x > canvas.width) dot1.vx *= -1;
        if (dot1.y < 0 || dot1.y > canvas.height) dot1.vy *= -1;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot1.x, dot1.y, dot1.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        // Draw lines to other dots
        for (let j = i + 1; j < numDots; j++) {
          const dot2 = dots[j];
          const distance = Math.sqrt(
            (dot1.x - dot2.x) ** 2 + (dot1.y - dot2.y) ** 2
          );

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(dot1.x, dot1.y);
            ctx.lineTo(dot2.x, dot2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / maxDistance})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = () => {
    if (prompt.trim()) {
      localStorage.setItem('prompt', prompt);
      navigate('/builder');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden">
      {/* Connected Dots Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <canvas id="dotsCanvas" className="absolute inset-0"></canvas>
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center p-4 bg-gray-900/50 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          AI Website Builder
        </h1>
        <div className="bg-gray-800/60 border border-white/10 rounded-full px-4 py-2 text-sm text-gray-300 max-w-md truncate text-center">
          <span className="font-semibold text-gray-100">Prompt:</span> {displayedText}
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <input
            type="text"
            className="w-full p-4 rounded-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="Describe your site..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            className="w-full p-4 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold"
            onClick={handleSubmit}
          >
            Build Website
          </button>
        </div>
      </div>
    </div>
  );
}
