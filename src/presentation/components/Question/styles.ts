import { keyframes, styled } from "@/presentation/config/stitches.config";
import { Button as ButtonComponent } from "vbss-ui";

export const shake = keyframes({
  "0%, 100%": { transform: "translateX(0)" },
  "25%": { transform: "translateX(-10px)" },
  "75%": { transform: "translateX(10px)" },
});

export const bounce = keyframes({
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-10px)" },
});

export const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

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

export const Question = styled("p", {
  fontSize: "1.2rem",
  lineHeight: "1.25rem",
  marginBottom: "1.5rem",
  textAlign: "center",
});

export const ButtonContainer = styled("div", {
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
});

export const Button = styled(ButtonComponent, {
  width: "8rem",
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
      no: {
        background: "linear-gradient(to right, #F87171, #EF4444)",
        zIndex: 9999,
      },
      extraYes: {
        position: "absolute",
        animation: `${grow} 0.5s ease-in-out`,
        background: "linear-gradient(to right, #34D399, #10B981)",
        "&:hover": {
          background: "linear-gradient(to right, #10B981, #059669)",
        },
      },
    },
  },
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
