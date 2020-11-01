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

// Clear cache if requested
if (window.location.href.includes("clear_cache")) {
  window.localStorage.setItem("kmHeader", "false");
  window.localStorage.setItem("kmSidebar", "false");
}

// Retrieve local storage cache as bool
const hide_header = window.localStorage.getItem("kmHeader") == "true";
const hide_sidebar = window.localStorage.getItem("kmSidebar") == "true";

// If any from local storage are true
const run = !!(hide_sidebar || hide_header);

const kiosk_mode = () => {
  setTimeout(() => {
    if (window.location.href.includes("disable_kiosk")) return;
    // Only run if location includes one of the keywords.
    if (locIncludes(["kiosk", "hide_header", "hide_sidebar"]) || run) {
      const header = getHeaderElem();
      const sidebar = getSidebarElem();
      // Insert style element for kiosk or hide_header options.
      if (
        (locIncludes(["kiosk", "hide_header"]) || hide_header) &&
        header &&
        !header.querySelector("#kiosk_mode")
      ) {
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
        // Set local storage cache for hiding header
        if (window.location.href.includes("cache")) {
          window.localStorage.setItem("kmHeader", "true");
        }
      }
      // Insert style element for kiosk or hide_sidebar options.
      if (
        (locIncludes(["kiosk", "hide_sidebar"]) || hide_sidebar) &&
        sidebar &&
        !sidebar.querySelector("#kiosk_mode")
      ) {
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
        // Set local storage cache for hiding sidebar
        if (window.location.href.includes("cache")) {
          window.localStorage.setItem("kmSidebar", "true");
        }
      }
    }
    window.dispatchEvent(new Event("resize"));
  }, 200);
};

new MutationObserver(kiosk_mode).observe(
  document
    .querySelector("home-assistant")
    .shadowRoot.querySelector("home-assistant-main")
    .shadowRoot.querySelector("partial-panel-resolver"),
  { childList: true }
);

kiosk_mode();

console.info(
  `%c  KIOSK-MODE   \n%c Version 1.1.0 `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
