import { keyframes, styled } from "@/presentation/config/stitches.config";
import { Button as ButtonComponent, Dialog as DialogComponent } from "vbss-ui";

const slideUp = keyframes({
  "0%": { opacity: 0, transform: "translateY(24px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const Container = styled("div", {
  display: "flex",
  justifyContent: "center",
  animation: `${slideUp} 0.5s ease 1.2s backwards`,
});

export const OpenButton = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.6rem 1.4rem",
  borderRadius: "9999px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  color: "white",
  transition: "all 0.3s",

  "&:hover": {
    background: "linear-gradient(to right, #DB2777, #9333EA)",
    transform: "scale(1.05)",
  },
});

export const Modal = styled(DialogComponent, {
  maxWidth: "24rem",
  width: "92vw",
  backgroundColor: "white",
});

export const Image = styled("img", {
  width: "100%",
  maxHeight: "55vh",
  objectFit: "contain",
  borderRadius: "0.75rem",
});

export const Actions = styled("div", {
  width: "100%",
  display: "flex",
  gap: "0.75rem",
  justifyContent: "flex-end",
});

export const ActionButton = styled(ButtonComponent, {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.6rem 1.25rem",
  borderRadius: "9999px",
  border: "none",
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  color: "white",
  transition: "all 0.3s",

  "&:hover": {
    background: "linear-gradient(to right, #DB2777, #9333EA)",
    transform: "scale(1.05)",
  },
});
