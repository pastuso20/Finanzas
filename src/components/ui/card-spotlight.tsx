import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import React, { MouseEvent as ReactMouseEvent, useState } from "react";
import { cn } from "../../components/ui";
import { CanvasRevealEffect } from "./canvas-reveal-effect";

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "#262626",
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  return (
    <div
      className={cn(
        "group/spotlight p-10 rounded-md relative overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute z-0 -inset-px rounded-md opacity-100 transition duration-300"
        style={{
          backgroundColor: color,
        }}
      >
        <CanvasRevealEffect
          animationSpeed={5}
          containerClassName="bg-transparent absolute inset-0 pointer-events-none"
          colors={[
            [59, 130, 246],
            [139, 92, 246],
          ]}
          dotSize={3}
        />
      </motion.div>
      {children}
    </div>
  );
};
