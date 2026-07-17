import { cn } from "../../components/ui";
import React, { useEffect, useRef } from "react";

export const CanvasRevealEffect = ({
  animationSpeed = 5,
  containerClassName,
  colors,
  dotSize = 3,
}: {
  animationSpeed?: number;
  containerClassName?: string;
  colors?: number[][];
  dotSize?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = dotSize * 3;
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Create a noise-like effect for opacity using sine waves
          const noise = Math.sin(x * 0.05 + time) * Math.cos(y * 0.05 + time) * Math.sin(time * 0.5);
          const opacity = Math.max(0, Math.min(1, noise + 0.5));

          if (opacity > 0.1) {
            // Select color based on grid position for a nice blend
            const colorGroup = colors ? colors[(i + j) % colors.length] : [255, 255, 255];
            ctx.fillStyle = `rgba(${colorGroup[0]}, ${colorGroup[1]}, ${colorGroup[2]}, ${opacity * 0.8})`;
            ctx.fillRect(x, y, dotSize, dotSize);
          }
        }
      }
      time += animationSpeed * 0.01;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationSpeed, colors, dotSize]);

  return (
    <div className={cn("h-full w-full absolute inset-0", containerClassName)}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ opacity: 0.8 }} />
    </div>
  );
};
