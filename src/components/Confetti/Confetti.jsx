import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Confetti.module.css';

const Confetti = ({ active, duration = 3000, onComplete }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6bcf7f', '#a29bfe', '#fd79a8'];
    const particleCount = 150;

    class ConfettiParticle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height - canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.w = Math.random() * 10 + 5;
        this.h = Math.random() * 5 + 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.velocityX = Math.random() * 2 - 1;
        this.velocityY = Math.random() * 3 + 2;
        this.gravity = 0.1;
        this.opacity = 1;
      }

      update() {
        this.velocityY += this.gravity;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height) {
          this.opacity -= 0.05;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
      }
    }

    particlesRef.current = Array.from({ length: particleCount }, () => new ConfettiParticle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const timer = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      onComplete && onComplete();
    }, duration);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timer);
    };
  }, [active, duration, onComplete]);

  if (!active) return null;

  return createPortal(
    <canvas ref={canvasRef} className={styles.canvas} />,
    document.body
  );
};

export default Confetti;