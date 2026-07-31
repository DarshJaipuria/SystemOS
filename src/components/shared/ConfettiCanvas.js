// FILE: src/components/shared/ConfettiCanvas.js
'use client';

import { useEffect, useRef } from 'react';

export default function ConfettiCanvas() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const handleTrigger = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6'];
      particlesRef.current = Array.from({ length: 80 }).map(() => ({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 50,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: 6 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1
      }));

      const startTime = Date.now();

      const animate = () => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed > 3000) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particlesRef.current = [];
          cancelAnimationFrame(animationFrameId.current);
          return;
        }

        particlesRef.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          if (elapsed > 2000) {
            p.opacity = Math.max(0, 1 - (elapsed - 2000) / 1000);
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });

        animationFrameId.current = requestAnimationFrame(animate);
      };

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animate();
    };

    window.addEventListener('triggerConfetti', handleTrigger);
    return () => {
      window.removeEventListener('triggerConfetti', handleTrigger);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
