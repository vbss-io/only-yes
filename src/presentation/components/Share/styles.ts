import { styled } from "@/presentation/config/stitches.config";
import { Button as ButtonComponent } from "vbss-ui";

export const Container = styled("div", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",

  input: {
    width: "100%",
    color: "black",
  },
});

export const Label = styled("p", {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "$text",
  marginBottom: "0.35rem",
});

export const Hint = styled("p", {
  fontSize: "0.75rem",
  color: "#9CA3AF",
  marginTop: "0.35rem",
});

export const ShareButton = styled(ButtonComponent, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.6rem 1.25rem",
  borderRadius: "9999px",
  border: "none",
  alignSelf: "flex-start",
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  color: "white",
  transition: "all 0.3s",

  "&:hover": {
    background: "linear-gradient(to right, #DB2777, #9333EA)",
    transform: "scale(1.05)",
  },
});
