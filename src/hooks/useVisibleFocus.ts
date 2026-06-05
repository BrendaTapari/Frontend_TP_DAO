import { useEffect, type RefObject } from "react";

/**
 * Hook to manage keyboard focus visibility.
 * It uses an IntersectionObserver to set tabindex="-1" on elements
 * that are currently out of the viewport, preventing them from being focusable
 * via the TAB key until they are scrolled into view.
 */
export function useVisibleFocus(
  ref: RefObject<HTMLElement | null>,
  selector: string = "button, a, input, select, textarea, [tabindex]"
) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            // Restore original tabindex if we saved it
            const orig = el.getAttribute("data-orig-tabindex");
            if (orig !== null) {
              el.setAttribute("tabindex", orig);
            } else {
              el.removeAttribute("tabindex");
            }
          } else {
            // Element is not visible, hide from keyboard navigation
            if (!el.hasAttribute("data-orig-tabindex")) {
              const current = el.getAttribute("tabindex");
              if (current !== null) {
                el.setAttribute("data-orig-tabindex", current);
              }
            }
            el.setAttribute("tabindex", "-1");
          }
        });
      },
      {
        root: null, // observe relative to viewport
        threshold: 0.1, // at least 10% visible
      }
    );

    // Initial query
    const elements = container.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    // Also observe mutations in case elements are added dynamically
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              // Check if the added node matches the selector
              if (el.matches && el.matches(selector)) {
                observer.observe(el);
              }
              // Check its children
              const children = el.querySelectorAll(selector);
              children.forEach((child) => observer.observe(child));
            }
          });
        }
      });
    });

    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref, selector]);
}
