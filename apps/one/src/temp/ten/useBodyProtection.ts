import { useEffect } from "react";

interface UseBodyProtectionOptions {
  enabled?: boolean;
  className?: string;
  ariaHidden?: boolean;
}

export function useBodyProtection({
  enabled = false,
  className = "dom-protected",
  ariaHidden = true,
}: UseBodyProtectionOptions = {}): void {
  useEffect(() => {
    const body = document.body;

    if (!body) return;

    body.inert = enabled;

    if (ariaHidden) {
      body.setAttribute("aria-hidden", String(enabled));
    }

    if (className) {
      body.classList.toggle(className, enabled);
    }

    return () => {
      body.inert = false;
      body.removeAttribute("aria-hidden");

      if (className) {
        body.classList.remove(className);
      }
    };
  }, [enabled, className, ariaHidden]);
}
