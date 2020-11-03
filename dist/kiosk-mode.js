"use strict";var a,i=document.querySelector("home-assistant").shadowRoot.querySelector("home-assistant-main").shadowRoot,e=i.querySelector(
"partial-panel-resolver"),c=i.querySelector("app-drawer-layout");function d(e){var o=window.location.href;return e.some(function(e){return o.includes(
e)})}function l(e){return e&&!e.querySelector("#kiosk_mode")}function s(e,o){var n=document.createElement("style");n.setAttribute("id","kiosk_mode"),
n.innerHTML=e,o.appendChild(n),window.dispatchEvent(new Event("resize"))}function u(e,o){window.localStorage.setItem(e,o)}function h(e){
return"true"==window.localStorage.getItem(e)}function o(){var e,o=window.location.href,n=h("kmHeader"),t=h("kmSidebar"),r=t||n;o.includes(
"disable_kiosk")||(d(["kiosk","hide_header","hide_sidebar"])||r)&&(e=i.querySelector("ha-panel-lovelace").shadowRoot.querySelector("hui-root"
).shadowRoot,(d(["kiosk","hide_header"])||n)&&l(e)&&(
a="\n          #view {\n            min-height: 100vh !important;\n          }\n          app-header {\n            display: none;\n          }\n        "
,setTimeout(function(){s(a,e)},100),o.includes("cache")&&u("kmHeader","true")),(d(["kiosk","hide_sidebar"])||t)&&l(c)&&(s(
"\n          :host {\n            --app-drawer-width: 0 !important;\n          }\n          #drawer {\n            display: none;\n          }\n        "
,c),o.includes("cache")&&u("kmSidebar","true")))}function n(e){e.forEach(function(e){e.addedNodes.forEach(function(e){
"ha-panel-lovelace"==e.localName&&new MutationObserver(t).observe(e.shadowRoot,{childList:!0})})})}function t(e){e.forEach(function(e){
e.addedNodes.forEach(function(e){"hui-root"==e.localName&&o()})})}window.location.href.includes("clear_cache")&&["kmHeader","kmSidebar"].forEach(
function(e){return u(e,"false")}),o(),new MutationObserver(n).observe(e,{childList:!0}),console.info("%c  KIOSK-MODE   \n%c Version 1.2.1 ",
"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray");