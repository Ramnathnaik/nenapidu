import Swal, { SweetAlertOptions } from "sweetalert2";

// Function to detect if dark mode is active
const isDarkMode = (): boolean => {
  const themeStorage = JSON.parse(
    localStorage.getItem("theme-storage") || "false"
  );

  return themeStorage && themeStorage?.state?.darkMode;
};

// Dark mode configuration
const getDarkModeConfig = () => ({
  background: "#1f2937", // gray-800
  color: "#f9fafb", // gray-50
  confirmButtonColor: "#8b5cf6", // violet-500
  cancelButtonColor: "#6b7280", // gray-500
  customClass: {
    popup: "swal-dark-popup",
    title: "swal-dark-title",
    content: "swal-dark-content",
    confirmButton: "swal-dark-confirm-button",
    cancelButton: "swal-dark-cancel-button",
    loader: "swal-dark-loader",
  },
});

// Light mode configuration
const getLightModeConfig = () => ({
  background: "#ffffff",
  color: "#111827", // gray-900
  confirmButtonColor: "#8b5cf6", // violet-500
  cancelButtonColor: "#6b7280", // gray-500
  customClass: {
    popup: "swal-light-popup",
    title: "swal-light-title",
    content: "swal-light-content",
    confirmButton: "swal-light-confirm-button",
    cancelButton: "swal-light-cancel-button",
    loader: "swal-light-loader",
  },
});

// Common type for popup with theme observer
type PopupWithThemeObserver = HTMLElement & {
  _themeObserver?: MutationObserver;
};

// Enhanced Swal function with reactive dark mode support
export const swal = {
  fire: (options: SweetAlertOptions) => {
    // Always check dark mode at the time of calling
    const themeConfig = isDarkMode()
      ? getDarkModeConfig()
      : getLightModeConfig();

    const mergedOptions = {
      ...themeConfig,
      ...options,
      customClass: {
        ...themeConfig.customClass,
        ...(options.customClass || {}),
      },
      // Add a hook to update theme if the modal stays open during theme change
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          // Add a class to identify our themed popups
          popup.classList.add("swal-themed");

          // Set up a mutation observer to watch for theme changes
          const observer = new MutationObserver(() => {
            const currentlyDark = isDarkMode();
            const popupIsDark = popup.classList.contains("swal-dark-popup");

            if (currentlyDark && !popupIsDark) {
              // Switch to dark mode
              const darkConfig = getDarkModeConfig();
              popup.style.backgroundColor = darkConfig.background;
              popup.style.color = darkConfig.color;

              // Update classes
              popup.className = popup.className.replace(
                /swal-light-\w+/g,
                (match) => {
                  return match.replace("light", "dark");
                }
              );
            } else if (!currentlyDark && popupIsDark) {
              // Switch to light mode
              const lightConfig = getLightModeConfig();
              popup.style.backgroundColor = lightConfig.background;
              popup.style.color = lightConfig.color;

              // Update classes
              popup.className = popup.className.replace(
                /swal-dark-\w+/g,
                (match) => {
                  return match.replace("dark", "light");
                }
              );
            }
          });

          // Watch for changes on the document element (where dark class is typically toggled)
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
          });

          // Also watch body element
          observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
          });

          // Clean up observer when modal closes
          const originalDidOpen = options.didOpen;
          if (originalDidOpen) {
            originalDidOpen(popup);
          }

          // Store observer reference for cleanup
          (popup as PopupWithThemeObserver)._themeObserver = observer;
        }
      },
      willClose: () => {
        const popup = Swal.getPopup();
        const popupWithObserver = popup as PopupWithThemeObserver;
        if (popupWithObserver && popupWithObserver._themeObserver) {
          popupWithObserver._themeObserver.disconnect();
        }

        const originalWillClose = options.willClose;
        if (originalWillClose && popup) {
          originalWillClose(popup);
        }
      },
    };

    return Swal.fire(mergedOptions);
  },

  // Convenience methods
  success: (title: string, text?: string, timer: number = 3000) => {
    return swal.fire({
      icon: "success",
      title,
      text,
      timer,
      showConfirmButton: false,
    });
  },

  error: (title: string, text?: string, timer?: number) => {
    return swal.fire({
      icon: "error",
      title,
      text,
      timer,
      showConfirmButton: timer ? false : true,
    });
  },

  warning: (
    title: string,
    text: string,
    confirmButtonText: string = "Yes",
    cancelButtonText: string = "Cancel"
  ) => {
    return swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
    });
  },

  loading: (title: string, text?: string) => {
    return swal.fire({
      title,
      text,
      allowOutsideClick: false,
      didOpen: (popup: HTMLElement) => {
        // Add a class to identify our themed popups
        popup.classList.add("swal-themed");

        // Set up theme observer
        const observer = new MutationObserver(() => {
          const currentlyDark = isDarkMode();
          const popupIsDark = popup.classList.contains("swal-dark-popup");

          if (currentlyDark && !popupIsDark) {
            const darkConfig = getDarkModeConfig();
            popup.style.backgroundColor = darkConfig.background;
            popup.style.color = darkConfig.color;
            popup.className = popup.className.replace(
              /swal-light-\w+/g,
              (match) => {
                return match.replace("light", "dark");
              }
            );
          } else if (!currentlyDark && popupIsDark) {
            const lightConfig = getLightModeConfig();
            popup.style.backgroundColor = lightConfig.background;
            popup.style.color = lightConfig.color;
            popup.className = popup.className.replace(
              /swal-dark-\w+/g,
              (match) => {
                return match.replace("dark", "light");
              }
            );
          }
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"],
        });

        (popup as PopupWithThemeObserver)._themeObserver = observer;

        // Show the loading spinner
        Swal.showLoading();
      },
      willClose: () => {
        const popup = Swal.getPopup();
        if (popup && (popup as PopupWithThemeObserver)._themeObserver) {
          const themeObserver = (popup as PopupWithThemeObserver)
            ._themeObserver;
          if (themeObserver) {
            themeObserver.disconnect();
          }
        }
      },
    });
  },

  info: (title: string, text?: string) => {
    return swal.fire({
      icon: "info",
      title,
      text,
    });
  },
};

export default swal;
