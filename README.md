# kiosk-mode

[![hacs_badge](https://img.shields.io/badge/HACS-Default-yellow.svg)](https://github.com/custom-components/hacs) [![hacs_badge](https://img.shields.io/badge/Buy-Me%20a%20Coffee-critical)](https://www.buymeacoffee.com/FgwNR2l)

Hides the header and/or sidebar drawer in [Home Assistant](https://www.home-assistant.io/)

![image](example1.png)

# Installation

*If you previously used [custom-header](https://github.com/maykar/custom-header) you need to uninstall it from [HACS](https://hacs.xyz/)*<br>

**Follow only one of two installation methods below, HACS or Manually:**

<details>
  <summary><b>Installation and tracking with HACS</b></summary>
<br>

* In the "Frontend" section of [HACS](https://github.com/hacs/integration) hit the plus icon in the bottom right
* Search for `Kiosk Mode` and install it
* If using YAML mode or if HACS doesn't automatically add it you'll need to add the resource below

YAML mode users will add it to their [configuration.yaml](https://www.home-assistant.io/lovelace/dashboards-and-views/#adding-more-dashboards-with-yaml) file.
Non-YAML mode, or Storage Mode, users can find resources in their sidebar under `"Configuration" > "Lovelace Dashboards" > "Resources"`

```yaml
resources:
  - url: /hacsfiles/kiosk-mode/kiosk-mode.js
    type: module
```
<br>
</details>

<details>
  <summary><b>Manual installation</b></summary>
<br>
  
* Download [kiosk-mode.js](https://github.com/matt8707/kiosk-mode/releases/latest) from the latest release and place it in your `www` folder
* Add the resource below

YAML mode users add it to their [configuration.yaml](https://www.home-assistant.io/lovelace/dashboards-and-views/#adding-more-dashboards-with-yaml) file.
Non-YAML mode, or Storage Mode, users can find resources in their sidebar under `"Configuration" > "Lovelace Dashboards" > "Resources"`

```yaml
resources:
  # You'll need to update the version number at the end of the url after every update.
  - url: /local/kiosk-mode.js?v=1.2.1
    type: module
```
<br>
</details>

*If you have trouble installing please [read this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins)*

# Usage
Add a query string such as `?kiosk` to the end of your URL:

```
https://hass:8123/lovelace/default_view?kiosk
```

## Query Strings

The query string options are:

* `?kiosk` to hide both header and sidebar
* `?hide_header` to hide only the header
* `?hide_sidebar` to hide only the sidebar

## Cache

You save settings in a devices cache by using the cache keyword once on the device.<br>This will also make it so the options work on all views and dashboards.

Example: `?hide_header&cache` makes all views & dashboards hide the header.<br>
This works for all query strings except for the utility strings listed below.

**Utility Query Strings**

* `?clear_km_cache` will clear all cached preferences
* `?disable_km` will temporarily disable any modifications

# Configuration in Lovelace

* Config is placed in the root of your Lovelace config (`kiosk_mode:` should not be indented) & is per dashboard.
* If you want the same settings on other dashboards you'll need to repeat the config on those dashboards as well.

There are 2 methods to setup config in Lovelace: Global and Conditional.

The order in which the 3 config methods are used is this:
* Conditional Lovelace config overrides Query Strings, Cached config, & Global config.
* Query Strings & Cached configs override Global Lovelace config.

## Global Lovelace Config

* kisok-mode has 3 options: `kiosk`, `hide_header`, and `hide_sidebar`. Set any option to true to activate.
* `kiosk` sets `hide_header` and `hide_sidebar` to true, no need to set either if you set `kiosk: true`.

<details>
  <summary><b>Global Config Example</b></summary>
<br>

```
kiosk_mode:
  hide_header: true
  
views:
```
*Note: `views:` is added in the example above to show where `kiosk_mode:` should be placed in your Lovelace config*

<br>
</details>

## Conditional Lovelace Config

This option uses the same options as global, but uses 3 conditions in order to use the options.

<hr>

**Admin Condition:**
Sets the settings for every admin user.

<details>
  <summary><b>Admin Config Example</b></summary>
<br>

```
kiosk_mode:
  admin_settings:
    hide_header: true
  
views:
```
*Note: `views:` is added in the example above to show where `kiosk_mode:` should be placed in your Lovelace config*

<br>
</details>

<hr>

**Non-Admin Condition:**
Sets the settings for every regular user.

<details>
  <summary><b>Non-Admin Config Example</b></summary>
<br>

```
kiosk_mode:
  non_admin_settings:
    hide_header: true
  
views:
```
*Note: `views:` is added in the example above to show where `kiosk_mode:` should be placed in your Lovelace config*

<br>
</details>

<hr>

**User Condition:**
Sets the settings for specific users. **This uses a user's name, not their username (if they're different)**.

<details>
  <summary><b>User Config Condition</b></summary>
<br>

```
kiosk_mode:
  user_settings:
    - users:
        - "ryan meek"
        - "maykar"
      hide_sidebar: true
    - users:
        - "the wife"
        - "another user"
      kiosk: true
  
views:
```
*Note: `views:` is added in the example above to show where `kiosk_mode:` should be placed in your Lovelace config*

<br>
</details>

<hr>

### Related

* [Fully Kiosk Browser](https://www.fully-kiosk.com/) - Great for wall mounted tablets
* [Applicationize](https://applicationize.me/) - Convert web apps into desktop apps
* [KTibow/fullscreen-card](https://github.com/KTibow/fullscreen-card) - Make your Home Assistant browser fullscreen

### Credit
This was originally based on and inspired by [ciotlosm's kiosk mode gist](https://gist.github.com/ciotlosm/1f09b330aa5bd5ea87b59f33609cc931) and [corrafig's fork](https://gist.github.com/corrafig/c8288df960e7f59e82c12d14de26fde8) of the same gist.

Big thank you to [matt8707](https://github.com/matt8707) for starting this project, allowing me to rewrite it, and transfering ownership.

Many thanks to [KTibow](https://github.com/KTibow) as well, for the github release action and support.
