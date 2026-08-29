import { keyframes, styled } from "@/presentation/config/stitches.config";
import { Button as ButtonComponent } from "vbss-ui";

export const grow = keyframes({
  "0%": { transform: "scale(0)" },
  "75%": { transform: "scale(1.2)" },
  "100%": { transform: "scale(1)" },
});

export const Container = styled("div", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
});

export const Card = styled("div", {
  maxWidth: "40rem",
  width: "100%",
  backgroundColor: "white",
  borderRadius: "1rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",

  variants: {
    animation: {
      true: {
        animation: `${grow}  0.5s ease-in-out`,
      },
    },
  },
});

export const ButtonContainer = styled("div", {
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
});

export const Button = styled(ButtonComponent, {
  minWidth: "8rem",
  maxWidth: "10rem",
  height: "3.5rem",
  borderRadius: "10rem",
  border: "none",
  fontSize: "1rem",
  transition: "all 0.3s ease",

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
    },
  },
});

export const NoButton = styled(ButtonComponent, {
  minWidth: "8rem",
  maxWidth: "10rem",
  height: "3.5rem",
  borderRadius: "10rem",
  border: "none",
  fontSize: "1rem",
  background: "linear-gradient(to right, #F87171, #EF4444)",
  touchAction: "none",

  variants: {
    fled: {
      true: {
        position: "fixed",
        left: 0,
        top: 0,
        margin: 0,
        zIndex: 9999,
        willChange: "transform",
        maxWidth: "none",
      },
    },
  },
});

export const ButtonSlot = styled("span", {
  display: "inline-block",
  minWidth: "8rem",
  height: "3.5rem",
});

export const TauntBubble = styled("div", {
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 10000,
  opacity: 0,
  transition: "opacity 0.2s",
  pointerEvents: "none",
  willChange: "transform",
  backgroundColor: "white",
  color: "#1F2937",
  padding: "0.4rem 0.9rem",
  borderRadius: "0.75rem",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  fontSize: "0.9rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
});

export const CloneButton = styled(ButtonComponent, {
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 9998,
  willChange: "transform",
  minWidth: "8rem",
  height: "3.5rem",
  borderRadius: "10rem",
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
  borderRadius: "10rem",
  background: "linear-gradient(to right, #34D399, #10B981)",
  animation: `${grow} 0.4s ease-out backwards`,
  transition: "transform 0.2s",

  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },

  "&:hover": {
    background: "linear-gradient(to right, #10B981, #059669)",
    transform: "scale(1.05)",
  },
});

export const ResultStack = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  width: "100%",
});

export const RedirectContainer = styled("div", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  gap: "1rem",

  h1: {
    fontSize: "1.5rem",
    color: "$primary",
  },

  a: {
    textDecoration: "underline",
  },
});
