import { useEffect } from "react";

export const useNoIndex = (active: boolean): void => {
  useEffect(() => {
    if (!active) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, [active]);
};
