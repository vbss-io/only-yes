import { styled } from "@/presentation/config/stitches.config";
import { Button } from "vbss-ui";

export const Container = styled("div", {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
});

export const Card = styled("div", {
  maxWidth: "40rem",
  width: "100%",
  backgroundColor: "$text",
  borderRadius: "1rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "2rem",

  "@md": {
    maxWidth: "50rem",
  },
});

export const Header = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "2rem",

  h1: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "$background",
    marginLeft: "0.5rem",
  },

  svg: {
    width: "1.5rem",
    height: "1.5rem",
    color: "$primary",
  },

  "@xsm": {
    h1: {
      fontSize: "1.875rem",
    },

    svg: {
      width: "2rem",
      height: "2rem",
    },
  },
});

export const Form = styled("form", {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",

  label: {
    color: "$background",
  },
});

export const Answers = styled("div", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",

  div: {
    width: "100%",

    input: {
      width: "100%",
    },
  },

  "@xsm": {
    flexDirection: "row",
  },
});

export const ErrorMessage = styled("span", {
  fontSize: "0.75rem",
  color: "red",
});

export const SelectContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});

export const SelectLabel = styled("label", {
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
});

export const Select = styled("select", {
  width: "100%",
  borderRadius: "0.375rem",
  height: "2.25rem",
  fontSize: ".875rem",
  padding: " 0.5rem 0.75rem",
  border: "1px solid #e5e7eb",

  "&>option": {
    "&:hover": {
      backgroundColor: "red !important",
      boxShadow: "0 0 10px 100px #1882A8 inset",
    },
  },
});

export const SubmitContainer = styled("div", {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "1rem",

  variants: {
    questionCreatedOrError: {
      true: {
        justifyContent: "space-between",
      },
    },
  },

  "@sm": {
    flexDirection: "row",
  },
});

export const SubmitErrorMessage = styled("em", {
  fontSize: "1rem",
  color: "red",
});

export const SubmitButton = styled(Button, {
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  border: "none",
  transition: "all 0.3s",
  transform: "scale(1)",
  minWidth: "10rem",
  height: "3rem",
  width: "100%",

  "&:hover": {
    background: "linear-gradient(to right, #DB2777, #9333EA)",
    transform: "scale(1.05)",
  },

  ".loadingContainer": {
    minHeight: "1.5rem",
    height: "1.5rem",

    div: {
      width: "2rem",
      height: "2rem",
    },
  },

  "@sm": {
    width: "unset",
  },
});

export const LinkContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",

  input: {
    width: "100%",
  },
});
