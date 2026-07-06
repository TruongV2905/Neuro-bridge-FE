"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

type AuthFormTransitionProps = {
  children: React.ReactNode;
};

const pageVariants = {
  initial: {
    opacity: 0,
    y: 18,
    scale: 0.98,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -18,
    scale: 0.98,
    filter: "blur(8px)",
  },
};

function AuthFormTransition({ children }: AuthFormTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          variants={reduceMotion ? undefined : pageVariants}
          initial={reduceMotion ? { opacity: 0 } : "initial"}
          animate={reduceMotion ? { opacity: 1 } : "animate"}
          exit={reduceMotion ? { opacity: 0 } : "exit"}
          transition={{
            duration: 0.62,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 w-full overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { AuthFormTransition };