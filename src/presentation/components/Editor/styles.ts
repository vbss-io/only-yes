import { styled } from "@/presentation/config/stitches.config";

export const Container = styled("div", {
  transition: "all 0.5s ease",

  variants: {
    viewMode: {
      true: {
        ".ProseMirror": {
          border: "none !important",
        },
      },
    },
  },

  ".ProseMirror": {
    padding: "1rem",
    minHeight: "80px",
    borderRadius: "0.375rem",
    border: "1px solid #e5e7eb !important",
    backgroundColor: "white",

    "&:focus": {
      outline: "1px solid $primary",
    },
  },

  ".tiptap": {
    ul: {
      listStyle: "unset",
      marginLeft: "1rem",
    },

    ol: {
      listStyle: "auto",
      marginLeft: "1rem",
    },

    h1: {
      fontSize: "2rem",
    },

    h2: {
      fontSize: "1.5rem",
    },

    h3: {
      fontSize: "1.3rem",
    },

    blockquote: {
      paddingLeft: "1rem",
      borderLeft: "2px solid $primary",
    },

    "p.is-editor-empty:first-child::before": {
      color: "#adb5bd",
      content: "attr(data-placeholder)",
      fontSize: "0.875rem",
      float: "left",
      height: "0",
      pointerEvents: "none",
    },

    img: {
      maxHeight: "20rem",
      justifySelf: "center",
    },
  },
});

export const EditorContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem",
});

export const EditorLabel = styled("label", {
  fontSize: "0.875rem",
});

export const EditorError = styled("span", {
  fontSize: "0.75rem",
  color: "red",
});
