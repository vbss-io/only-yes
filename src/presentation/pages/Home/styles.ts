import { styled } from "@/presentation/config/stitches.config";

export const Container = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

export const Text = styled("p", {
  fontSize: "1.25rem",
  color: "#4B5563",
});

export const Button = styled("a", {
  marginTop: "1rem",
  padding: "0.75rem 1.5rem",
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  color: "#FFF",
  borderRadius: "9999px",
  textDecoration: "none",
  transition: "all 0.3s",
  transform: "scale(1)",

  "&:hover": {
    background: "linear-gradient(to right, #DB2777, #9333EA)",
    transform: "scale(1.05)",
  },
});
