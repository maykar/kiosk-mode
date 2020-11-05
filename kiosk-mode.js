const ha = document.querySelector("home-assistant");
const main = ha.shadowRoot.querySelector("home-assistant-main").shadowRoot;
const panel = main.querySelector("partial-panel-resolver");
const drawerLayout = main.querySelector("app-drawer-layout");

function getConfig() {
  const ll = main.querySelector("ha-panel-lovelace")
  return ll && ll.lovelace.config.kiosk_mode ? ll.lovelace.config.kiosk_mode : null;
}

// Return true if any keyword is found in location.
function locIncludes(keywords) {
  const url = window.location.href;
  return keywords.some((x) => url.includes(x));
}

// Check if element exists and if style element already exists.
function styleCheck(elem) {
  return elem && !elem.querySelector("#kiosk_mode");
}

// Insert style element.
function addStyles(css, elem) {
  const style = document.createElement("style");
  style.setAttribute("id", "kiosk_mode");
  style.innerHTML = css;
  elem.appendChild(style);
  window.dispatchEvent(new Event("resize"));
}

// Set localStorage item.
function setCache(k, v) {
  window.localStorage.setItem(k, v);
}

// Retrieve localStorage item as bool.
function cacheAsBool(k) {
  return window.localStorage.getItem(k) == "true";
}

// Clear cache if requested.
if (window.location.href.includes("clear_km_cache")) {
  ["kmHeader", "kmSidebar"].forEach((k) => setCache(k, "false"));
}

function kiosk_mode() {
  const url = window.location.href;
  const config = getConfig();

  // Retrieve localStorage values.
  const hide_header = cacheAsBool("kmHeader") || locIncludes(["kiosk", "hide_header"]);
  const hide_sidebar = cacheAsBool("kmSidebar") || locIncludes(["kiosk", "hide_sidebar"]);

  if (config) {
    const hass = ha.hass;
  }

  // Disable styling if "disable_kiosk" in URL.
  if (url.includes("disable_km")) return;

  const lovelace = main.querySelector("ha-panel-lovelace");

  // Only run if needed.
  if (hide_sidebar || hide_header) {
    const huiRoot = lovelace ? lovelace.shadowRoot.querySelector("hui-root").shadowRoot : null;

    // Insert style element for kiosk or hide_header options.
    if (hide_header && styleCheck(huiRoot)) {
      const css = "#view { min-height: 100vh !important } app-header { display: none }";
      addStyles(css, huiRoot);

      // Set localStorage cache for hiding header.
      if (url.includes("cache")) setCache("kmHeader", "true");
    }

    // Insert style element for kiosk or hide_sidebar options.
    if (hide_sidebar && styleCheck(drawerLayout)) {
      const css = ":host { --app-drawer-width: 0 !important } #drawer { display: none }";
      addStyles(css, drawerLayout);

      // Set localStorage cache for hiding sidebar.
      if (url.includes("cache")) setCache("kmSidebar", "true");
    }
  }
}

// Initial run.
kiosk_mode();

// Watch for changes in partial-panel-resolver's children.
new MutationObserver(lovelaceWatch).observe(panel, { childList: true });

// If new lovelace panel was added watch for hui-root to appear.
function lovelaceWatch(mutations) {
  mutations.forEach(({ addedNodes }) => {
    addedNodes.forEach((e) => {
      if (e.localName == "ha-panel-lovelace") {
        new MutationObserver(rootWatch).observe(e.shadowRoot, {
          childList: true,
        });
      }
    });
  });
}

// When hui-root appears watch for children.
function rootWatch(mutations) {
  mutations.forEach(({ addedNodes }) => {
    addedNodes.forEach((e) => {
      if (e.localName == "hui-root") {
        new MutationObserver(appLayoutWatch).observe(e.shadowRoot, {
          childList: true,
        });
      }
    });
  });
}

// When ha-app-layout appears we can run.
function appLayoutWatch(mutations) {
  mutations.forEach(({ addedNodes }) => {
    addedNodes.forEach((e) => {
      if (e.localName == "ha-app-layout") kiosk_mode();
    });
  });
}

console.info(
  `%c  KIOSK-MODE   \n%c Version 1.3.1 `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
