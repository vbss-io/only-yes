import { styled } from "@/presentation/config/stitches.config";
import { Button as ButtonComponent, Dialog as DialogComponent } from "vbss-ui";

export const Container = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.2rem",
  padding: "0.5rem",
  flexDirection: "row",
  flexWrap: "wrap",
});

export const Divider = styled("div", {
  backgroundColor: "$background",
  width: "1px",
  height: "1.5rem",
});

export const Button = styled(ButtonComponent, {
  svg: {
    color: "$background",
    width: "1rem",
    height: "1rem",
  },

  variants: {
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
    active: {
      true: {
        svg: {
          color: "white",
        },
      },
    },
    color: {
      true: {
        svg: {
          color: "var(--color)",
        },
      },
    },
    backgroundColor: {
      true: {
        svg: {
          color: "var(--backgroundColor)",
        },
      },
    },
  },
});

export const ColorInputContainer = styled("div", {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderRadius: "10rem",

  "&:hover": {
    backgroundColor: "rgba(168, 85, 247, 0.1)",
  },
});

export const ColorInput = styled("input", {
  position: "absolute",
  border: "none",
  cursor: "pointer",
  width: "100%",
  height: "100%",
  opacity: 0,
  display: "hidden",
});

export const Preview = styled("div", {
  width: "100%",
  height: "40px",
  borderRadius: "$sm",
  backgroundColor: "$primaryLight",
  border: "1px solid $border",
});

export const ColorCode = styled("div", {
  fontSize: "0.875rem",
  color: "$text",
});

export const Dialog = styled(DialogComponent, {
  backgroundColor: "$background",
  color: "$text",

  h2: {
    color: "$text",
  },

  p: {
    color: "$text",
  },

  input: {
    width: "100%",
    color: "black",
  },
});
