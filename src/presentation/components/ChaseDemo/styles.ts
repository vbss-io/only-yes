import { keyframes, styled } from "@/presentation/config/stitches.config";
import { Button as ButtonComponent } from "vbss-ui";

const grow = keyframes({
  "0%": { transform: "scale(0)" },
  "75%": { transform: "scale(1.2)" },
  "100%": { transform: "scale(1)" },
});

export const Card = styled("div", {
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

export const Question = styled("p", {
  fontSize: "1.35rem",
  fontWeight: 600,
  textAlign: "center",
  color: "#1F2937",
});

export const Buttons = styled("div", {
  display: "flex",
  gap: "1rem",
});

export const DemoButton = styled(ButtonComponent, {
  minWidth: "7rem",
  height: "3.25rem",
  borderRadius: "9999px",
  border: "none",
  fontSize: "1rem",

  variants: {
    variant: {
      yes: {
        background: "linear-gradient(to right, #34D399, #10B981)",
        transition: "transform 0.3s ease",
        "&:hover": {
          background: "linear-gradient(to right, #10B981, #059669)",
          transform: "scale(1.05)",
        },
      },
      no: {
        background: "linear-gradient(to right, #F87171, #EF4444)",
        zIndex: 10,
        touchAction: "none",
      },
    },
    fled: {
      true: {
        position: "absolute",
        left: 0,
        top: 0,
        margin: 0,
        willChange: "transform",
      },
    },
  },
});

export const Slot = styled("span", {
  display: "inline-block",
  minWidth: "7rem",
  height: "3.25rem",
});

export const Taunt = styled("div", {
  position: "absolute",
  left: 0,
  top: 0,
  zIndex: 12,
  opacity: 0,
  transition: "opacity 0.2s",
  pointerEvents: "none",
  willChange: "transform",
  backgroundColor: "#1F2937",
  color: "white",
  padding: "0.35rem 0.8rem",
  borderRadius: "0.75rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
});

export const Clone = styled(ButtonComponent, {
  position: "absolute",
  left: 0,
  top: 0,
  zIndex: 9,
  willChange: "transform",
  minWidth: "7rem",
  height: "3.25rem",
  borderRadius: "9999px",
  border: "none",
  fontSize: "1rem",
  padding: 0,
  background: "transparent",

  "&:hover": {
    background: "transparent",
  },
});

export const CloneInner = styled("span", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  borderRadius: "9999px",
  background: "linear-gradient(to right, #34D399, #10B981)",
  animation: `${grow} 0.4s ease-out backwards`,

  "&:hover": {
    background: "linear-gradient(to right, #10B981, #059669)",
  },

  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
});

export const Result = styled("p", {
  fontSize: "1.35rem",
  fontWeight: 600,
  textAlign: "center",
  color: "#10B981",
  animation: `${grow} 0.5s ease-in-out`,

  span: {
    display: "block",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#6B7280",
    marginTop: "0.5rem",
  },
});
