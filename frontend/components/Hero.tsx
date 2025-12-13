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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with organic gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-50/50 to-lime-50/80">
        {mediaType === "image" && (
          <img
            src={mediaSrc}
            alt="Hero background"
            className="w-full h-full object-cover opacity-30"
          />
        )}
        {mediaType === "video" && (
          <video
            src={mediaSrc}
            poster={posterSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-white/80 to-lime-50/90" />
      </div>

      {/* Organic decorative shapes */}
      <div className="absolute top-12 right-20 w-72 h-72 bg-green-300/20 rounded-[40%_60%_70%_30%/_40%_50%_60%_50%] z-0 hidden lg:block" />
      <div className="absolute bottom-20 left-16 w-64 h-64 bg-lime-300/15 rounded-[60%_40%_30%_70%/_60%_30%_70%_40%] z-0 hidden lg:block" />
      <div className="absolute top-32 right-8 w-48 h-48 bg-green-200/10 rounded-[30%_70%_50%_50%/_50%_30%_70%_50%] z-0 md:hidden" />
      <div className="absolute bottom-32 left-8 w-40 h-40 bg-lime-200/10 rounded-[70%_30%_30%_70%/_40%_60%_60%_40%] z-0 md:hidden" />

      <motion.div {...motionProps} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-3 bg-green-100 border-2 border-green-200 text-green-800 px-6 py-3 rounded-[20px] text-sm font-semibold mb-8 shadow-lg backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-green-800" />
            <span>AI-Powered Wellness Revolution</span>
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-8xl font-black text-green-950 mb-8 leading-tight">
          {headline}
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-green-700 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
          {subhead}
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to={primaryCta.href}>
            <Button
              size="lg"
              className="h-16 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25 hover:shadow-green-500/35 hover:from-green-600 hover:to-green-700 text-white border-0"
            >
              {primaryCta.text}
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </Link>
          {secondaryCta && (
            <Link to={secondaryCta.href}>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 text-lg font-bold rounded-2xl bg-white text-green-700 border-2 border-green-200 hover:bg-green-50 hover:border-green-300"
              >
                {secondaryCta.text}
              </Button>
            </Link>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
