let ha, main, panel, drawerLayout, user;
let llAttempts = 0;
window.kioskModeEntities = {};

Promise.resolve(customElements.whenDefined("hui-view")).then(() => {
  ha = document.querySelector("home-assistant");
  main = ha.shadowRoot.querySelector("home-assistant-main").shadowRoot;
  panel = main.querySelector("partial-panel-resolver");
  drawerLayout = main.querySelector("app-drawer-layout");
  user = ha.hass.user;
  run();
  observer();
  entityWatch();
});

function run() {
  const lovelace = main.querySelector("ha-panel-lovelace");

  // Don't run if disabled via query string or not on a lovelace page.
  if (queryString("disable_km") || !lovelace) return;

  const dash = ha.hass.panelUrl;
  if (!window.kioskModeEntities[dash]) window.kioskModeEntities[dash] = [];
  getConfig(lovelace, dash);
}

// Wait 2 seconds for lovelace config, then run.
function getConfig(lovelace, dash) {
  llAttempts++;
  try {
    const llConfig = lovelace.lovelace.config;
    const config = llConfig.kiosk_mode || {};
    kioskMode(lovelace, config, dash);
  } catch {
    if (llAttempts < 40) {
      setTimeout(() => getConfig(lovelace), 50);
    } else {
      console.log("Lovelace config not found, continuing with default configuration.");
      kioskMode(lovelace, {}, dash);
    }
  }
}

// Convert to array.
function array(x) {
  return Array.isArray(x) ? x : [x];
}

// Return true if any keyword is found in query strings.
function queryString(keywords) {
  return array(keywords).some((x) => window.location.search.includes(x));
}

// Set localStorage item.
function setCache(k, v) {
  array(k).forEach((x) => window.localStorage.setItem(x, v));
}

// Retrieve localStorage item as bool.
function cached(k) {
  return window.localStorage.getItem(k) == "true";
}

// Check if element and style element exist.
function styleExists(elem) {
  return elem.querySelector(`#kiosk_mode_${elem.localName}`);
}

// Insert style element.
function addStyle(css, elem) {
  if (!styleExists(elem)) {
    const style = document.createElement("style");
    style.setAttribute("id", `kiosk_mode_${elem.localName}`);
    style.innerHTML = css;
    elem.appendChild(style);
  }
}

// Remove style element.
function removeStyle(elements) {
  array(elements).forEach((elem) => {
    if (styleExists(elem)) elem.querySelector(`#kiosk_mode_${elem.localName}`).remove();
  });
}

function kioskMode(lovelace, config, dash) {
  llAttempts = 0;
  const huiRoot = lovelace.shadowRoot.querySelector("hui-root").shadowRoot;
  const appToolbar = huiRoot.querySelector("app-toolbar");
  const states = ha.hass.states;
  const adminConfig = config.admin_settings;
  const nonAdminConfig = config.non_admin_settings;
  const entityConfig = config.entity_settings;
  const userConfig = config.user_settings;
  const mobileConfig = config.mobile_settings;
  let ignoreEntity = false;
  let ignoreMobile = false;

  // Retrieve localStorage values & query string options.
  let hideHeader = cached("kmHeader") || queryString(["kiosk", "hide_header"]);
  let hideSidebar = cached("kmSidebar") || queryString(["kiosk", "hide_sidebar"]);
  const queryStringsSet = hideSidebar || hideHeader;

  // Use config values only if config strings and cache aren't used.
  hideHeader = queryStringsSet ? hideHeader : config.kiosk || config.hide_header;
  hideSidebar = queryStringsSet ? hideSidebar : config.kiosk || config.hide_sidebar;

  // Admin user's settings.
  if (adminConfig && user.is_admin) {
    hideHeader = adminConfig.kiosk || adminConfig.hide_header;
    hideSidebar = adminConfig.kiosk || adminConfig.hide_sidebar;
    ignoreEntity = adminConfig.ignore_entity_settings;
    ignoreMobile = adminConfig.ignore_mobile_settings;
  }

  // Non-Admin user settings.
  if (nonAdminConfig && !user.is_admin) {
    hideHeader = nonAdminConfig.kiosk || nonAdminConfig.hide_header;
    hideSidebar = nonAdminConfig.kiosk || nonAdminConfig.hide_sidebar;
    ignoreEntity = nonAdminConfig.ignore_entity_settings;
    ignoreMobile = nonAdminConfig.ignore_mobile_settings;
  }

  // User Settings.
  if (userConfig) {
    for (let conf of array(userConfig)) {
      if (array(conf.users).some((x) => x.toLowerCase() == user.name.toLowerCase())) {
        hideHeader = conf.kiosk || conf.hide_header;
        hideSidebar = conf.kiosk || conf.hide_sidebar;
        ignoreEntity = conf.ignore_entity_settings;
        ignoreMobile = conf.ignore_mobile_settings;
      }
    }
  }

  // Mobile settings.
  if (mobileConfig && !ignoreMobile) {
    const mobileWidth = mobileConfig.custom_width ? mobileConfig.custom_width : 812;
    if (window.innerWidth <= mobileWidth) {
      hideHeader = mobileConfig.kiosk || mobileConfig.hide_header;
      hideSidebar = mobileConfig.kiosk || mobileConfig.hide_sidebar;
      ignoreEntity = mobileConfig.ignore_entity_settings;
    }
  }

  // Entity Settings.
  if (entityConfig && !ignoreEntity) {
    for (let conf of entityConfig) {
      const entity = Object.keys(conf.entity)[0];
      const state = conf.entity[entity];
      if (!window.kioskModeEntities[dash].includes(entity)) window.kioskModeEntities[dash].push(entity);
      if (states[entity].state == state) {
        if ("hide_header" in conf) hideHeader = conf.hide_header;
        if ("hide_sidebar" in conf) hideSidebar = conf.hide_sidebar;
        if ("kiosk" in conf) hideHeader = hideSidebar = conf.kiosk;
      }
    }
  }

  // Hide or show header.
  if (hideHeader) {
    addStyle("#view{min-height:100vh !important;--header-height:0;}app-header{display:none;}", huiRoot);
    if (queryString("cache")) setCache("kmHeader", "true");
  } else {
    removeStyle(huiRoot);
  }

  // Hide or show sidebar and button.
  if (hideSidebar) {
    addStyle(":host{--app-drawer-width:0 !important;}#drawer{display:none;}", drawerLayout);
    addStyle("ha-menu-button{display:none !important;}", appToolbar);
    if (queryString("cache")) setCache("kmSidebar", "true");
  } else {
    removeStyle([appToolbar, drawerLayout]);
  }

  // Resize window to "refresh" view.
  window.dispatchEvent(new Event("resize"));
}

// Clear cache if requested.
if (queryString("clear_km_cache")) setCache(["kmHeader", "kmSidebar"], "false");

// Run on entity state change events.
async function entityWatch() {
  (await window.hassConnection).conn.subscribeMessage(
    (e) => {
      const ent = window.kioskModeEntities[ha.hass.panelUrl] || [];
      if (
        ent.length &&
        e.event_type == "state_changed" &&
        ent.includes(e.data.entity_id) &&
        (!e.data.old_state || e.data.new_state.state != e.data.old_state.state)
      ) {
        run();
      }
    },
    {
      type: "subscribe_events",
      event_type: "state_changed",
    }
  );
}

// Run on element changes.
function observer() {
  new MutationObserver(lovelaceWatch).observe(panel, { childList: true });

  // If new lovelace panel was added watch for hui-root to appear.
  function lovelaceWatch(mutations) {
    mutationWatch(mutations, "ha-panel-lovelace", rootWatch);
  }

  // When hui-root appears watch it's children.
  function rootWatch(mutations) {
    mutationWatch(mutations, "hui-root", appLayoutWatch);
  }

  // When ha-app-layout appears we can run.
  function appLayoutWatch(mutations) {
    mutationWatch(mutations, "ha-app-layout", null);
  }

  // Reusable function for observers.
  function mutationWatch(mutations, nodename, observeElem) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.localName == nodename) {
          if (observeElem) new MutationObserver(observeElem).observe(node.shadowRoot, { childList: true });
          else run();
        }
      });
    });
  }
}

// Overly complicated console tag.
const conInfo = { header: "%c≡ kiosk-mode".padEnd(27), ver: "%cversion *DEV " };
const br = "%c\n";
const maxLen = Math.max(...Object.values(conInfo).map((el) => el.length));
for (const [key] of Object.entries(conInfo)) {
  if (conInfo[key].length <= maxLen) conInfo[key] = conInfo[key].padEnd(maxLen);
  if (key == "header") conInfo[key] = `${conInfo[key].slice(0, -1)}⋮ `;
}
const header =
  "display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;";
const info = "border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";
console.info(conInfo.header + br + conInfo.ver, header, "", `${header} ${info}`);
