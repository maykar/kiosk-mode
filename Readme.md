kiosk-mode
=================

Hides header and sidebar drawer in [Home Assistant](https://www.home-assistant.io/).

Manual installation: Download [kiosk.js](https://raw.githubusercontent.com/matt8707/kiosk/master/kiosk.js) and place it in your `www` folder. If you have trouble installing [read this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

```yaml
resources:
  - url: /local/kiosk.js
    type: js
```

## Usage
Add the query string `?kiosk` to the end of your URL. 

```
https://hass:8123/lovelace/default_view?kiosk
```

## Note

If you previously used [custom-header](https://github.com/maykar/custom-header) you need to completely uninstall it from [HACS](https://github.com/hacs/integration).
