// Return true if any keyword is found in location.
const locIncludes = (keywords) => {
  return keywords.some((x) => window.location.href.includes(x));
};

const getHeaderElem = () => {
  try {
    return document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("ha-panel-lovelace")
      .shadowRoot.querySelector("hui-root").shadowRoot;
  } catch {
    return false;
  }
};

const getSidebarElem = () => {
  try {
    return document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("app-drawer-layout");
  } catch {
    return false;
  }
};

setTimeout(() => {
  const header = getHeaderElem();
  const sidebar = getSidebarElem();

  // Only run if location includes one of the keywords.
  if (locIncludes(["kiosk", "hide_header", "hide_sidebar"])) {
    // Insert style element for kiosk or hide_header options.
    if (locIncludes(["kiosk", "hide_header"])) {
      if (header) {
        const style = document.createElement("style");
        style.setAttribute("id", "kiosk_mode");
        style.innerHTML = `
            #view {
              min-height: 100vh !important;
            }
            app-header {
              display: none;
            }
          `;
        header.appendChild(style);
      }
    }
    // Insert style element for kiosk or hide_sidebar options.
    if (locIncludes(["kiosk", "hide_sidebar"])) {
      if (sidebar) {
        const style = document.createElement("style");
        style.setAttribute("id", "kiosk_mode");
        style.innerHTML = `
            :host {
              --app-drawer-width: 0 !important;
            }
            #drawer {
              display: none;
            }
          `;
        sidebar.appendChild(style);
      }
    }
  }
  window.dispatchEvent(new Event("resize"));
}, 200);

console.info(
  `%c  KIOSK-MODE   \n%c Version 1.1.0 `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
