kiosk-mode
=================

Hides header and sidebar drawer in [Home Assistant](https://www.home-assistant.io/).

![image](example.png)

Manual installation: Download [kiosk-mode.js](https://github.com/matt8707/kiosk-mode/blob/master/kiosk-mode.js) and place it in your `www` folder. If you have trouble installing [read this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

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

## Notes

* If you previously used [custom-header](https://github.com/maykar/custom-header) you need to completely uninstall it from [HACS](https://github.com/hacs/integration).
* [Fully Kiosk Browser](https://www.fully-kiosk.com/) - Great for wall mounted tablets
* [Applicationize](https://applicationize.me/) - Convert web apps into desktop apps
* [KTibow/fullscreen-card](https://github.com/KTibow/fullscreen-card) - Make your Home Assistant browser fullscreen
