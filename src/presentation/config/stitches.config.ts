import { createStitches, createTheme } from "@stitches/react";

export const { styled, keyframes, theme, globalCss } = createStitches({
  theme: {
    fonts: {
      default: "Arial",
    },
    colors: {
      background: "#FFFFFF",
      text: "#000000",
      primary: "#A855F7",
      secondary: "#ED4A9C",
    },
  },
  media: {
    xsm: "(min-width: 480px)",
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
    xlg: "(min-width: 1280px)",
  },
});

export const darkTheme = createTheme({
  colors: {
    background: "#151B23",
    text: "#FFFFFF",
    primary: "#A855F7",
    secondary: "#ED4A9C",
  },
});

export const Root = styled("div", {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  alignContent: "center",
  flexDirection: "column",
  justifyContent: "space-between",
  fontFamily: "Arial",
  backgroundColor: "$background",
  gap: "1rem",
});
