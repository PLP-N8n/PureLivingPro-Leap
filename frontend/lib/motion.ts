export const motionContract = {
  reveal: {
    initial: { y: 16, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hoverCard: {
    y: -8,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1, ease: "easeOut" },
  },
  heroMedia: {
    type: "video|lottie|image",
    fallback: "image",
  },
};
