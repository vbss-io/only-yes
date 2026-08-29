import { styled } from "@/presentation/config/stitches.config";
import { Button as ButtonComponent } from "vbss-ui";

export const Container = styled("main", {
  width: "100%",
  maxWidth: "46rem",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  padding: "2rem 1rem 4rem",
});

export const Card = styled("section", {
  backgroundColor: "white",
  borderRadius: "1rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
});

export const Header = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem",
});

export const Question = styled("h1", {
  fontSize: "1.35rem",
  color: "#1F2937",
  lineHeight: 1.35,
});

export const Subtitle = styled("p", {
  fontSize: "0.9rem",
  color: "#6B7280",
  marginTop: "0.35rem",

  a: {
    color: "#A855F7",
    fontWeight: 600,
  },
});

export const RefreshButton = styled(ButtonComponent, {
  flexShrink: 0,
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: "9999px",
  border: "none",
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  transition: "all 0.3s",

  "&:hover": {
    transform: "rotate(180deg) scale(1.05)",
  },
});

export const StatGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "0.75rem",

  "@md": {
    gridTemplateColumns: "repeat(4, 1fr)",
  },
});

export const StatTile = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "0.25rem",
  padding: "1rem 0.5rem",
  borderRadius: "0.75rem",
  backgroundColor: "#FAF5FF",
});

export const StatValue = styled("span", {
  fontSize: "1.6rem",
  fontWeight: 700,
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
});

export const StatLabel = styled("span", {
  fontSize: "0.8rem",
  color: "#6B7280",
});

export const SectionTitle = styled("h2", {
  fontSize: "1.05rem",
  color: "#1F2937",
});

export const Timeline = styled("ul", {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  listStyle: "none",
});

export const TimelineItem = styled("li", {
  display: "flex",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.6rem 0.9rem",
  borderRadius: "0.6rem",
  backgroundColor: "#F9FAFB",
  fontSize: "0.9rem",
  color: "#374151",
  flexWrap: "wrap",
});

export const TimelineWhen = styled("span", {
  color: "#9CA3AF",
});

export const Message = styled("p", {
  fontSize: "1rem",
  color: "$text",
  textAlign: "center",
  padding: "2rem 0",
});

export const MyQuestionItem = styled("a", {
  display: "flex",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.6rem 0.9rem",
  borderRadius: "0.6rem",
  backgroundColor: "#F9FAFB",
  fontSize: "0.9rem",
  color: "#374151",
  textDecoration: "none",
  flexWrap: "wrap",
  transition: "background 0.2s",

  "&:hover": {
    backgroundColor: "#FAF5FF",
  },
});
