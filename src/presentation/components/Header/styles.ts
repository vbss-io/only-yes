import { styled } from "@/presentation/config/stitches.config";
import {
  Button as ButtonComponent,
  DropdownMenu as DropdownMenuComponent,
} from "vbss-ui";

export const Nav = styled("nav", {
  backgroundColor: "$text",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "1rem",
});

export const Container = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  height: "3rem",

  "@xsm": {
    justifyContent: "space-between",
  },
});

export const Brand = styled("a", {
  display: "none",
  alignItems: "center",
  textDecoration: "none",
  color: "$primary",
  transition: "color 0.3s",

  "& > span": {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginLeft: "0.5rem",
  },

  "@xsm": {
    display: "flex",
  },
});

export const Actions = styled("div", {
  display: "flex",
  gap: "1rem",
});

export const DropdownMenu = styled(DropdownMenuComponent, {
  minWidth: "1.5rem !important",
  padding: "0.5rem",
  backgroundColor: "white",
});

export const Language = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",

  svg: {
    width: "1.5rem",
    height: "1.5rem",
  },
});

export const DesktopButton = styled(ButtonComponent, {
  padding: "0.5rem 1rem",
  background: "linear-gradient(to right, #EC4899, #A855F7)",
  color: "white",
  borderRadius: "9999px",
  transition: "all 0.3s",
  transform: "scale(1)",
  display: "none",

  "&:hover": {
    background: "linear-gradient(to right, #DB2777, #9333EA)",
    transform: "scale(1.05)",
  },

  "&:after": {
    content: "var(--create)",
  },

  "@xsm": {
    display: "flex",
    justifyContent: "space-between",
  },
});

export const MobileButton = styled(DesktopButton, {
  display: "flex",

  "@xsm": {
    display: "none",
  },
});
