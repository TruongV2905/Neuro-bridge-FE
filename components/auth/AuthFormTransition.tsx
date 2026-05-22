"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

type AuthFormTransitionProps = {
  children: React.ReactNode;
};

function AuthFormTransition({ children }: AuthFormTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative w-full min-h-[430px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.995 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.995 }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 w-full will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default AuthFormTransition;
