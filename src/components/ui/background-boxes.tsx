
"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Boxes = () => {
  const rows = new Array(3).fill(1);
  const cols = new Array(3).fill(1);
  
  const boxVariants = {
    initial: {
      y: 0,
      opacity: 0,
    },
    animate: {
      y: [-20, 0, -20],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div
      style={{
        transform: `translate(-40%, -40%) rotate(45deg)`,
      }}
      className="absolute left-1/2 top-1/2"
    >
      {rows.map((_, i) => (
        <motion.div className="flex" key={`row-${i}`}>
          {cols.map((_, j) => (
            <motion.div
              key={`col-${j}`}
              variants={boxVariants}
              initial="initial"
              animate="animate"
              custom={j}
              className={cn(
                "h-32 w-32 bg-white/30 m-1 rounded-lg",
                "dark:bg-white/10"
              )}
              style={{
                animationDelay: `${(i + j) * 0.2}s`,
              }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};
