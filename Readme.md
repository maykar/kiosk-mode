# Kiosk mode

## Installation

Add `kiosk.js` file with the content below to your `www` folder in config.

Like any other custom script, use `ui-lovelace.yaml` resources section to reference the `kiosk.js` file.

Make sure you add the id `kiosk` for your view 

```yaml
views:
  - title: Kiosk
    icon: mdi:heart
    id: kiosk
```

## Note

If this is your first file in `www` make sure you restart Home Assistant.