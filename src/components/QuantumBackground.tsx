import React, { useEffect, useRef } from 'react';

interface QuantumBackgroundProps {
  intensity?: 'high' | 'low';
  className?: string;
  overlay?: boolean;
}

export function QuantumBackground({ intensity = 'low', className = '', overlay = true }: QuantumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.offsetWidth * dpr;
      canvas.height = container.offsetHeight * dpr;
      canvas.style.width = `${container.offsetWidth}px`;
      canvas.style.height = `${container.offsetHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class QuantumNode {
      x: number;
      y: number;
      size: number;
      angle: number;
      speed: number;
      direction: { x: number; y: number };
      color: string;
      connections: QuantumNode[];

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * (intensity === 'high' ? 7 : 3.5) + (intensity === 'high' ? 3.5 : 1.8);
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.17 + (intensity === 'high' ? 0.09 : 0.045);
        this.direction = {
          x: Math.cos(this.angle),
          y: Math.sin(this.angle)
        };
        this.color = Math.random() < 0.5 
          ? `rgba(30, 58, 138, ${intensity === 'high' ? 0.35 : 0.18})` 
          : `rgba(0, 217, 192, ${intensity === 'high' ? 0.35 : 0.18})`;
        this.connections = [];
      }

      update(width: number, height: number, time: number) {
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        if (this.x < 0 || this.x > width) {
          this.direction.x *= -1;
          this.x = this.x < 0 ? 0 : width;
          this.angle = Math.round(this.angle / (Math.PI / 2)) * (Math.PI / 2);
        }
        if (this.y < 0 || this.y > height) {
          this.direction.y *= -1;
          this.y = this.y < 0 ? 0 : height;
          this.angle = Math.round(this.angle / (Math.PI / 2)) * (Math.PI / 2);
        }

        this.angle = Math.round(time * 0.009) * (Math.PI / 2);
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.beginPath();
        ctx.rect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = intensity === 'high' ? 1.8 : 0.9;
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2);
        ctx.strokeStyle = this.color.replace(/[\d.]+\)$/, '0.12)');
        ctx.stroke();
        
        ctx.restore();

        this.connections.forEach(node => {
          const distance = Math.hypot(this.x - node.x, this.y - node.y);
          const maxDistance = intensity === 'high' ? 275 : 165;
          
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(node.x, node.y);

            const alpha = intensity === 'high' ? 0.22 : 0.11;
            ctx.strokeStyle = `rgba(30, 58, 138, ${(1 - distance / maxDistance) * alpha})`;
            ctx.lineWidth = intensity === 'high' ? 0.85 : 0.45;
            ctx.stroke();
          }
        });
      }
    }

    const nodes: QuantumNode[] = [];
    const density = intensity === 'high' ? 18000 : 27000;
    const numNodes = Math.floor((canvas.width * canvas.height) / density);

    const gridSize = Math.ceil(Math.sqrt(numNodes));
    const cellWidth = canvas.width / window.devicePixelRatio / gridSize;
    const cellHeight = canvas.height / window.devicePixelRatio / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i + 0.5) * cellWidth;
        const y = (j + 0.5) * cellHeight;
        nodes.push(new QuantumNode(x, y));
      }
    }

    nodes.forEach(node => {
      nodes.forEach(otherNode => {
        if (node !== otherNode) {
          const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
          const maxDistance = intensity === 'high' ? 275 : 165;
          if (distance < maxDistance) {
            node.connections.push(otherNode);
          }
        }
      });
    });

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      nodes.forEach(node => {
        node.update(
          canvas.width / window.devicePixelRatio,
          canvas.height / window.devicePixelRatio,
          time
        );
        node.draw(ctx);
      });

      time++;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [intensity]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      {overlay && (
        <div className={`absolute inset-0 bg-gradient-to-b ${
          intensity === 'high' 
            ? 'from-white/10 via-transparent to-white/10'
            : 'from-white/20 via-white/10 to-white/20'
        }`} />
      )}
    </div>
  );
}