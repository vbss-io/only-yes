import React from "react";
import ReactDOM from "react-dom/client";
import "vbss-ui/dist/style.css";

import App from "@/App.tsx";
import "@/customColors.css";
import { registerDependencies } from "@/infra/dependency-injection/Register";
import { globalCss } from "@/presentation/config/stitches.config";

registerDependencies();

const globalStyles = globalCss({
  html: {
    backgroundColor: "$background",
    minHeight: "100vh",
  },

  body: {
    unset: "all",
    margin: 0,
    padding: 0,
    border: 0,
    fontFamily: "$default",
    position: "relative",

    "::-webkit-scrollbar": {
      width: "0.25rem",
    },

    "::-webkit-scrollbar-track": {
      backgroundColor: "#E5E7EB",
      borderRadius: "1rem",
    },

    "::-webkit-scrollbar-thumb": {
      backgroundColor: "$primary",
      borderRadius: "1rem",

      "&:hover": {
        backgroundColor: "$highlight",
      },

      "&:active": {
        backgroundColor: "$highlight",
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {globalStyles()}
    <App />
  </React.StrictMode>
);
