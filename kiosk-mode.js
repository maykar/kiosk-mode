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

const getPanelElem = () => {
  try {
    return document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("partial-panel-resolver");
  } catch {
    return false;
  }
};

// Check if element exists and if style element already exists.
const styleCheck = (elem) => {
  return elem && !elem.querySelector("#kiosk_mode");
};

// Insert style element.
const addStyles = (css, elem) => {
  const style = document.createElement("style");
  style.setAttribute("id", "kiosk_mode");
  style.innerHTML = css;
  elem.appendChild(style);
};

// Clear cache if requested.
if (window.location.href.includes("clear_cache")) {
  window.localStorage.setItem("kmHeader", "false");
  window.localStorage.setItem("kmSidebar", "false");
}

const kiosk_mode = () => {
  // Retrieve local storage cache as bool.
  const hide_header = window.localStorage.getItem("kmHeader") == "true";
  const hide_sidebar = window.localStorage.getItem("kmSidebar") == "true";

  // If any from local storage are true.
  const run = hide_sidebar || hide_header;

  setTimeout(() => {
    // Disable styling if "disable_kiosk" in URL.
    if (window.location.href.includes("disable_kiosk")) return;

    // Only run if location includes one of the keywords.
    if (locIncludes(["kiosk", "hide_header", "hide_sidebar"]) || run) {
      const header = getHeaderElem();
      const sidebar = getSidebarElem();

      // Insert style element for kiosk or hide_header options.
      if ((locIncludes(["kiosk", "hide_header"]) || hide_header) && styleCheck(header)) {
        const css = `
          #view {
            min-height: 100vh !important;
          }
          app-header {
            display: none;
          }
        `;
        addStyles(css, header);

        // Set local storage cache for hiding header.
        if (window.location.href.includes("cache")) {
          window.localStorage.setItem("kmHeader", "true");
        }
      }

      // Insert style element for kiosk or hide_sidebar options.
      if ((locIncludes(["kiosk", "hide_sidebar"]) || hide_sidebar) && styleCheck(sidebar)) {
        const css = `
          :host {
            --app-drawer-width: 0 !important;
          }
          #drawer {
            display: none;
          }
        `;
        addStyles(css, sidebar);

        // Set local storage cache for hiding sidebar.
        if (window.location.href.includes("cache")) {
          window.localStorage.setItem("kmSidebar", "true");
        }
      }
    }

    // Resize window to apply changes.
    window.dispatchEvent(new Event("resize"));
  }, 200);
};

// Watch for changes in "partial-panel-resolver" and run kisok mode.
new MutationObserver(kiosk_mode).observe(getPanelElem(), { childList: true });

// Initial run.
kiosk_mode();

console.info(
  `%c  KIOSK-MODE   \n%c Version 1.2.1 `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
