import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMotion } from "../providers/MotionProvider";

interface HeroProps {
  mediaType: "image" | "video" | "lottie";
  mediaSrc: string;
  posterSrc?: string;
  headline: React.ReactNode;
  subhead: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export function Hero({
  mediaType,
  mediaSrc,
  posterSrc,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  const { isReducedMotion } = useMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const motionProps = isReducedMotion
    ? {}
    : {
        initial: "hidden",
        animate: "visible",
        variants: containerVariants,
      };

  return (
    <section className="relative text-center py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {mediaType === "image" && (
          <img src={mediaSrc} alt="Hero background" className="w-full h-full object-cover" />
        )}
        {mediaType === "video" && (
          <video
            src={mediaSrc}
            poster={posterSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        {/* Lottie support would require a library like lottie-react */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/50" />
      </div>

      <motion.div {...motionProps} className="relative z-10 max-w-4xl mx-auto px-4">
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-lime-50 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-green-200/50 shadow-xl backdrop-blur-sm">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span>AI-Powered Wellness Revolution</span>
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-tight">
          {headline}
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
          {subhead}
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to={primaryCta.href}>
            <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl">
              {primaryCta.text}
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </Link>
          {secondaryCta && (
            <Link to={secondaryCta.href}>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl">
                {secondaryCta.text}
              </Button>
            </Link>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
