import { useEffect, RefObject } from "react";

/**
 * Hook que maneja el foco TAB solo en elementos visibles en pantalla
 * @param containerRef - Referencia al contenedor que agrupa los elementos
 * @param selector - Selector CSS de los elementos interactivos que queremos controlar (ej: "button, a, [role='listitem']")
 */
export function useVisibleFocus(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Encontrar todos los elementos interactivos
    const elements = container.querySelectorAll(selector);

    // Crear Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;

          // Si el elemento es visible en la pantalla, permitir TAB (tabindex >= 0)
          // Si no es visible, bloquear TAB (tabindex = -1)
          if (entry.isIntersecting) {
            // Restaurar el tabindex original o poner 0
            const originalTabIndex = element.getAttribute(
              "data-original-tabindex",
            );
            if (originalTabIndex !== null) {
              element.setAttribute("tabindex", originalTabIndex);
            } else if (!element.hasAttribute("tabindex")) {
              element.setAttribute("tabindex", "0");
            }
          } else {
            // Guardar el tabindex original antes de cambiarlo
            if (!element.hasAttribute("data-original-tabindex")) {
              const currentTabIndex = element.getAttribute("tabindex") || "0";
              element.setAttribute("data-original-tabindex", currentTabIndex);
            }
            // Bloquear el elemento para TAB
            element.setAttribute("tabindex", "-1");
          }
        });
      },
      {
        // El elemento debe estar al menos 10% visible en la pantalla
        threshold: 0.1,
        // Expandir el área de detección para anticiparse un poco
        rootMargin: "50px 0px -50px 0px",
      },
    );

    // Observar todos los elementos
    elements.forEach((element) => {
      observer.observe(element);
    });

    // Cleanup
    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
      observer.disconnect();
    };
  }, [selector]);
}
