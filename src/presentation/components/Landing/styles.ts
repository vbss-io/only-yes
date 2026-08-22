import { keyframes, styled } from "@/presentation/config/stitches.config";
import { Button as ButtonComponent } from "vbss-ui";

const shake = keyframes({
  "0%, 100%": { transform: "translateX(0)" },
  "25%": { transform: "translateX(-10px)" },
  "75%": { transform: "translateX(10px)" },
});

const grow = keyframes({
  "0%": { transform: "scale(0)" },
  "75%": { transform: "scale(1.2)" },
  "100%": { transform: "scale(1)" },
});

const float = keyframes({
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-10px)" },
});

export const Container = styled("main", {
  width: "100%",
  maxWidth: "72rem",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4rem",
  padding: "2rem 1rem 4rem",

  "@md": {
    padding: "3rem 2rem 5rem",
  },
});

export const Hero = styled("section", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "1.25rem",
  maxWidth: "44rem",
});

export const HeroBadge = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.4rem 1rem",
  borderRadius: "9999px",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "$primary",
  border: "1px solid $primary",
  animation: `${float} 3s ease-in-out infinite`,
});

export const HeroTitle = styled("h1", {
  fontSize: "2.25rem",
  lineHeight: 1.15,
  color: "$text",

  "& > span": {
    background: "linear-gradient(to right, #EC4899, #A855F7)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  "@md": {
    fontSize: "3.25rem",
  },
});

export const HeroSubtitle = styled("p", {
  fontSize: "1.1rem",
  lineHeight: 1.6,
  color: "$text",
  opacity: 0.8,

  "@md": {
    fontSize: "1.25rem",
  },
});

export const HeroActions = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.75rem",
});

export const CtaButton = styled(ButtonComponent, {
  padding: "1rem 2.5rem",
  height: "auto",
  fontSize: "1.1rem",
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  color: "white",
  borderRadius: "9999px",
  border: "none",
  transition: "all 0.3s",

  "&:hover": {
    background: "linear-gradient(to right, #DB2777, #9333EA)",
    transform: "scale(1.05)",
  },
});

export const CtaHint = styled("span", {
  fontSize: "0.9rem",
  color: "$text",
  opacity: 0.6,
});

export const Section = styled("section", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2rem",
});

export const SectionTitle = styled("h2", {
  fontSize: "1.75rem",
  textAlign: "center",
  color: "$text",

  "@md": {
    fontSize: "2.25rem",
  },
});

export const DemoCard = styled("div", {
  position: "relative",
  width: "100%",
  maxWidth: "34rem",
  minHeight: "16rem",
  backgroundColor: "white",
  borderRadius: "1rem",
  boxShadow: "0 10px 30px rgba(168, 85, 247, 0.25)",
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.5rem",
  overflow: "hidden",
});

export const DemoQuestion = styled("p", {
  fontSize: "1.35rem",
  fontWeight: 600,
  textAlign: "center",
  color: "#1F2937",
});

export const DemoButtons = styled("div", {
  display: "flex",
  gap: "1rem",
});

export const DemoButton = styled(ButtonComponent, {
  minWidth: "7rem",
  height: "3.25rem",
  borderRadius: "9999px",
  border: "none",
  fontSize: "1rem",
  transition: "transform 0.3s ease",

  "&:hover": {
    transform: "scale(1.05)",
  },

  variants: {
    variant: {
      yes: {
        background: "linear-gradient(to right, #34D399, #10B981)",
        "&:hover": {
          background: "linear-gradient(to right, #10B981, #059669)",
        },
      },
      no: {
        background: "linear-gradient(to right, #F87171, #EF4444)",
        zIndex: 10,
        animation: `${shake} 0.5s ease-in-out`,
      },
    },
  },
});

export const DemoResult = styled("p", {
  fontSize: "1.35rem",
  fontWeight: 600,
  textAlign: "center",
  color: "#10B981",
  animation: `${grow} 0.5s ease-in-out`,
});

export const Steps = styled("div", {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1.5rem",

  "@md": {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
});

export const StepCard = styled("article", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "0.75rem",
  padding: "2rem 1.5rem",
  borderRadius: "1rem",
  backgroundColor: "white",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
});

export const StepIcon = styled("div", {
  width: "3.5rem",
  height: "3.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9999px",
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  color: "white",

  svg: {
    width: "1.75rem",
    height: "1.75rem",
  },
});

export const StepTitle = styled("h3", {
  fontSize: "1.2rem",
  color: "#1F2937",
});

export const StepText = styled("p", {
  fontSize: "1rem",
  lineHeight: 1.6,
  color: "#4B5563",
});
