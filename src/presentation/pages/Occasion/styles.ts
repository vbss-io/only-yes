import { styled } from "@/presentation/config/stitches.config";

export const Container = styled("main", {
  width: "100%",
  maxWidth: "48rem",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  padding: "2.5rem 1rem 4rem",
});

export const Breadcrumb = styled("a", {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "$primary",
  textDecoration: "none",

  "&:hover": {
    textDecoration: "underline",
  },
});

export const Header = styled("header", {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const IconBadge = styled("div", {
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

export const Title = styled("h1", {
  fontSize: "1.9rem",
  lineHeight: 1.2,
  color: "$text",

  "@md": {
    fontSize: "2.4rem",
  },
});

export const Paragraph = styled("p", {
  fontSize: "1.05rem",
  lineHeight: 1.7,
  color: "$text",
  opacity: 0.85,
});

export const Section = styled("section", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.25rem",
});

export const SectionTitle = styled("h2", {
  fontSize: "1.4rem",
  color: "$text",
  textAlign: "center",
});

export const CtaButton = styled("a", {
  padding: "0.9rem 2.2rem",
  borderRadius: "9999px",
  fontSize: "1.05rem",
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

export const FaqList = styled("div", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const FaqItem = styled("article", {
  backgroundColor: "white",
  borderRadius: "0.9rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "1.25rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",

  h3: {
    fontSize: "1.05rem",
    color: "#1F2937",
  },

  p: {
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#4B5563",
  },
});

export const RelatedList = styled("div", {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
  justifyContent: "center",
});

export const RelatedLink = styled("a", {
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
