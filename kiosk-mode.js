const ha = document.querySelector("home-assistant");
const main = ha.shadowRoot.querySelector("home-assistant-main").shadowRoot;
const panel = main.querySelector("partial-panel-resolver");
const drawerLayout = main.querySelector("app-drawer-layout");
let llAttempts = 0;
window.kiosk_entities = [];

function run() {
  const lovelace = main.querySelector("ha-panel-lovelace");
  if (queryString("disable_km") || !lovelace) return;
  getConfig(lovelace);
}

function getConfig(lovelace) {
  llAttempts++;
  try {
    const llConfig = lovelace.lovelace.config;
    const config = llConfig.kiosk_mode || {};
    kioskMode(lovelace, config);
  } catch {
    if (llAttempts < 40) setTimeout(() => getConfig(lovelace), 50);
  }
}

function array(x) {
  return Array.isArray(x) ? x : [x];
}

// Return true if any keyword is found in query strings.
function queryString(keywords) {
  return array(keywords).some((x) => window.location.search.includes(x));
}

// Set localStorage item.
function setCache(k, v) {
  window.localStorage.setItem(k, v);
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

function kioskMode(lovelace, config) {
  llAttempts = 0;
  const hass = ha.hass;
  const huiRoot = lovelace.shadowRoot.querySelector("hui-root").shadowRoot;
  const appToolbar = huiRoot.querySelector("app-toolbar");
  const adminConfig = config.admin_settings;
  const nonAdminConfig = config.non_admin_settings;
  const entityConfig = config.entity_settings;
  let userConfig = config.user_settings;
  let ignoreEntity = false;

  // Retrieve localStorage values & query string options.
  let hideHeader = cached("kmHeader") || queryString(["kiosk", "hide_header"]);
  let hideSidebar = cached("kmSidebar") || queryString(["kiosk", "hide_sidebar"]);
  const queryStringsSet = hideSidebar || hideHeader;

  // Use config values only if config strings and cache aren't used.
  hideHeader = queryStringsSet ? hideHeader : config.kiosk || config.hide_header;
  hideSidebar = queryStringsSet ? hideSidebar : config.kiosk || config.hide_sidebar;

  if (adminConfig && hass.user.is_admin) {
    hideHeader = adminConfig.kiosk || adminConfig.hide_header;
    hideSidebar = adminConfig.kiosk || adminConfig.hide_sidebar;
    ignoreEntity = adminConfig.ignore_entity_settings;
  }

  if (nonAdminConfig && !hass.user.is_admin) {
    hideHeader = nonAdminConfig.kiosk || nonAdminConfig.hide_header;
    hideSidebar = nonAdminConfig.kiosk || nonAdminConfig.hide_sidebar;
    ignoreEntity = nonAdminConfig.ignore_entity_settings;
  }

  if (userConfig) {
    for (let conf of array(userConfig)) {
      if (array(conf.users).some((x) => x.toLowerCase() == hass.user.name.toLowerCase())) {
        hideHeader = conf.kiosk || conf.hide_header;
        hideSidebar = conf.kiosk || conf.hide_sidebar;
        ignoreEntity = conf.ignore_entity_settings;
      }
    }
  }

  if (entityConfig && !ignoreEntity) {
    for (let conf of entityConfig) {
      const entity = Object.keys(conf.entity)[0];
      const state = conf.entity[entity];
      if (!window.kiosk_entities.includes(entity)) window.kiosk_entities.push(entity);
      if (hass.states[entity].state == state) {
        if ("hide_header" in conf) hideHeader = conf.hide_header;
        if ("hide_sidebar" in conf) hideSidebar = conf.hide_sidebar;
        if ("kiosk" in conf) hideHeader = hideSidebar = conf.kiosk;
      }
    }
  }

  if (hideHeader) {
    addStyle("#view{min-height:100vh !important}app-header{display:none}", huiRoot);
    if (queryString("cache")) setCache("kmHeader", "true");
  } else {
    removeStyle(huiRoot);
  }

  if (hideSidebar) {
    addStyle(":host{--app-drawer-width:0 !important}#drawer{display:none}", drawerLayout);
    addStyle("ha-menu-button{display:none !important}", appToolbar);
    if (queryString("cache")) setCache("kmSidebar", "true");
  } else {
    removeStyle([appToolbar, drawerLayout]);
  }

  window.dispatchEvent(new Event("resize"));
}

// Clear cache if requested.
if (queryString("clear_km_cache")) ["kmHeader", "kmSidebar"].forEach((k) => setCache(k, "false"));

// Initial run.
run();

// Run on entity state change events.
function entityWatch() {
  window.hassConnection.then(({ conn }) => {
    if (!conn.connected) return;
    conn.socket.onclose = () => {
      window.kiosk_interval = setInterval(() => {
        if (conn.connected) clearInterval(window.kiosk_interval);
        entityWatch();
      }, 5000);
    };
    conn.socket.onmessage = (e) => {
      if (e.data && window.kiosk_entities.some((x) => e.data.includes(x) && e.data.includes("state_changed"))) {
        const event = JSON.parse(e.data).event;
        if (event.data.new_state.state != event.data.old_state.state) run();
      }
    };
  });
}
entityWatch();

// Run on element changes.
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

function mutationWatch(mutations, nodename, observeElem) {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node.localName == nodename) {
        if (observeElem) {
          new MutationObserver(observeElem).observe(node.shadowRoot, {
            childList: true,
          });
        } else {
          run();
        }
        return;
      }
    }
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
