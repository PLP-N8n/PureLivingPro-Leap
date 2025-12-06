"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none flex flex-col items-center justify-center opacity-40",
        className
      )}
    >
      <div className="absolute left-0 top-0 ml-[-100%] h-full w-[200%] md:ml-[-50%] md:w-full">
        <div className="absolute h-[100%] w-[100%] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-beam opacity-0 [animation-delay:2s] [animation-duration:10s]" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-primary/10 to-transparent h-px w-3/4 mx-auto" />
      </div>
    </div>
  );
};
