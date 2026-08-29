import { styled } from "@/presentation/config/stitches.config";

export const Container = styled("main", {
  width: "100%",
  maxWidth: "72rem",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2.5rem",
  padding: "2.5rem 1rem 4rem",
});

export const Title = styled("h1", {
  fontSize: "2rem",
  textAlign: "center",
  color: "$text",

  "@md": {
    fontSize: "2.5rem",
  },
});

export const Subtitle = styled("p", {
  fontSize: "1.05rem",
  lineHeight: 1.6,
  textAlign: "center",
  color: "$text",
  opacity: 0.8,
  maxWidth: "40rem",
});

export const Grid = styled("div", {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1.25rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },

  "@lg": {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
});

export const Card = styled("article", {
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

export const CardIcon = styled("div", {
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

export const CardTitle = styled("h2", {
  fontSize: "1.2rem",
  color: "#1F2937",
});

export const CardQuestion = styled("p", {
  fontSize: "1rem",
  lineHeight: 1.5,
  color: "#4B5563",
  fontStyle: "italic",
});

export const CardActions = styled("div", {
  marginTop: "auto",
  display: "flex",
  gap: "0.6rem",
  flexWrap: "wrap",
  justifyContent: "center",
  paddingTop: "0.75rem",
});

export const PrimaryAction = styled("a", {
  padding: "0.5rem 1.1rem",
  borderRadius: "9999px",
  fontSize: "0.9rem",
  fontWeight: 600,
  textDecoration: "none",
  color: "white",
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  transition: "all 0.3s",

  "&:hover": {
    background: "linear-gradient(to right, #DB2777, #9333EA)",
    transform: "scale(1.05)",
  },
});

export const SecondaryAction = styled("a", {
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
