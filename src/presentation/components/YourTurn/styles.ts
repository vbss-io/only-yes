import { keyframes, styled } from "@/presentation/config/stitches.config";

const fadeUp = keyframes({
  "0%": { opacity: 0, transform: "translateY(16px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const Container = styled("section", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.75rem",
  animation: `${fadeUp} 0.5s ease 2s backwards`,
});

export const Title = styled("p", {
  fontSize: "1rem",
  color: "$text",
  opacity: 0.85,
  textAlign: "center",
});

export const Options = styled("div", {
  display: "flex",
  gap: "0.6rem",
  flexWrap: "wrap",
  justifyContent: "center",
});

export const Option = styled("a", {
  padding: "0.5rem 1.1rem",
  borderRadius: "9999px",
  fontSize: "0.9rem",
  textDecoration: "none",
  color: "$primary",
  border: "1px solid $primary",
  transition: "all 0.3s",

  "&:hover": {
    background: "linear-gradient(to right, #EC4899, #A855F7)",
    color: "white",
    borderColor: "transparent",
  },
});
