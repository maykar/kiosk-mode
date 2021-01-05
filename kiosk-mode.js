const ha = document.querySelector("home-assistant");
const main = ha.shadowRoot.querySelector("home-assistant-main").shadowRoot;
const panel = main.querySelector("partial-panel-resolver");
const drawerLayout = main.querySelector("app-drawer-layout");
window.kiosk_entities = [];
let llAttempts = 0;
let config = {};
let ll;

function getConfig() {
  llAttempts++;
  try {
    const llConfig = ll.lovelace.config;
    config = llConfig.kiosk_mode || {};
    kiosk_mode();
  } catch {
    if (llAttempts < 40) setTimeout(() => getConfig(), 50)
  }
}

// Return true if any keyword is found in location.
function locIncludes(keywords) {
  const url = window.location.search;
  return keywords.some((x) => url.includes(x));
}

// Check if element exists and if style element already exists.
function styleCheck(elem) {
  return elem && !elem.querySelector("#kiosk_mode");
}

// Insert style element.
function addStyles(css, elem) {
  const style = document.createElement("style");
  const id = elem.localName == "app-toolbar" ? "kiosk_mode_menu" : "kiosk_mode";
  style.setAttribute("id", id);
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
if (window.location.search.includes("clear_km_cache")) {
  ["kmHeader", "kmSidebar"].forEach((k) => setCache(k, "false"));
}

function loadConfig() {
  ll = main.querySelector("ha-panel-lovelace")
  const url = window.location.search;

  // Return if not a Lovelace page or disabled via query string.
  if (url.includes("disable_km") || !ll) return;

  getConfig();
}

function kiosk_mode() {
  const hass = ha.hass;
  llAttempts = 0;

  // Retrieve localStorage values & query string options.
  let hide_header = cacheAsBool("kmHeader") || locIncludes(["kiosk", "hide_header"]);
  let hide_sidebar = cacheAsBool("kmSidebar") || locIncludes(["kiosk", "hide_sidebar"]);

  const adminConf = config.admin_settings;
  const nonAdminConf = config.non_admin_settings;
  let userConf = config.user_settings;
  let entityConf = config.entity_settings;
  const queryStringsSet = hide_sidebar || hide_header;

  // Use config values only if config strings and cache aren't used.
  hide_header = queryStringsSet ? hide_header : config.kiosk || config.hide_header;
  hide_sidebar = queryStringsSet ? hide_sidebar : config.kiosk || config.hide_sidebar;

  if (adminConf && hass.user.is_admin) {
    hide_header = adminConf.kiosk || adminConf.hide_header;
    hide_sidebar = adminConf.kiosk || adminConf.hide_sidebar;
  }

  if (nonAdminConf && !hass.user.is_admin) {
    hide_header = nonAdminConf.kiosk || nonAdminConf.hide_header;
    hide_sidebar = nonAdminConf.kiosk || nonAdminConf.hide_sidebar;
  }

  if (userConf) {
    if (!Array.isArray(userConf)) userConf = [userConf];
    for (let conf of userConf) {
      let users = conf.users;
      if (!Array.isArray(conf.users)) users = [users];
      if (users.some((x) => x.toLowerCase() == hass.user.name.toLowerCase())) {
        hide_header = conf.kiosk || conf.hide_header;
        hide_sidebar = conf.kiosk || conf.hide_sidebar;
      }
    }
  }

  if (entityConf) {
    for (let ent of entityConf) {
      const entity = Object.keys(ent.entity)[0];
      if (!window.kiosk_entities.includes(entity)) window.kiosk_entities.push(entity)
      const state = ent.entity[entity];
      if (hass.states[entity].state == state) {
        if ("kiosk" in ent) {
          hide_header = ent.kiosk;
          hide_sidebar = ent.kiosk;
        } else {
          if ("hide_header" in ent) hide_header = ent.hide_header;
          if ("hide_sidebar" in ent) hide_sidebar = ent.hide_sidebar;
        }
      }
    }
  }

  const lovelace = main.querySelector("ha-panel-lovelace");
  const huiRoot = lovelace ? lovelace.shadowRoot.querySelector("hui-root").shadowRoot : null;
  const toolbar = huiRoot ? huiRoot.querySelector("app-toolbar") : null;

  // Only run if needed.
  if (hide_sidebar || hide_header) {
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

      // Hide menu button.
      if (styleCheck(toolbar)) addStyles("ha-menu-button { display:none !important } ", toolbar);

      // Set localStorage cache for hiding sidebar.
      if (url.includes("cache")) setCache("kmSidebar", "true");
    }
  }

  // Remove styles if no longer hidden
  if (!hide_header && !styleCheck(huiRoot)) {
    huiRoot.querySelector("#kiosk_mode").remove()
  }
  if (!hide_sidebar && !styleCheck(drawerLayout)) {
    drawerLayout.querySelector("#kiosk_mode").remove()
  }
  if (!hide_sidebar && toolbar.querySelector("#kiosk_mode_menu")) {
    toolbar.querySelector("#kiosk_mode_menu").remove()
  }

  window.dispatchEvent(new Event("resize"));
}

// Initial run.
loadConfig();

// Watch for changes in partial-panel-resolver's children.
new MutationObserver(lovelaceWatch).observe(panel, { childList: true });

// If new lovelace panel was added watch for hui-root to appear.
function lovelaceWatch(mutations) {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node.localName == "ha-panel-lovelace") {
        new MutationObserver(rootWatch).observe(node.shadowRoot, {
          childList: true,
        });
        return;
      }
    }
  }
}

// When hui-root appears watch it's children.
function rootWatch(mutations) {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node.localName == "hui-root") {
        new MutationObserver(appLayoutWatch).observe(node.shadowRoot, {
          childList: true,
        });
        return;
      }
    }
  }
}

// When ha-app-layout appears we can run.
function appLayoutWatch(mutations) {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node.localName == "ha-app-layout") {
        window.kiosk_entities = [];
        config = {};
        loadConfig();
        return;
      }
    }
  }
}

// Run on state change events
window.hassConnection.then(({conn}) => conn.socket.onmessage = (e) => {
  if (window.kiosk_entities.length < 1) return;
  const event = JSON.parse(e.data).event;
  if (
    event &&
    event.event_type == "state_changed" &&
    (event.data.new_state.state != event.data.old_state.state) &&
    window.kiosk_entities.includes(event.data.entity_id)
  ) {
    config = {};
    loadConfig();
  }
});

// Overly complicated console tag.
const conInfo = { header: "%c≡ kiosk-mode".padEnd(27), ver: "%cversion *DEV " };
const br = "%c\n";
const maxLen = Math.max(...Object.values(conInfo).map((el) => el.length));
for (const [key] of Object.entries(conInfo)) {
  if (conInfo[key].length <= maxLen) conInfo[key] = conInfo[key].padEnd(maxLen);
  if (key == "header") conInfo[key] = `${conInfo[key].slice(0, -1)}⋮ `;
}
const header = "display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;";
const info = "border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";
console.info(conInfo.header + br + conInfo.ver, header, "", `${header} ${info}`);
