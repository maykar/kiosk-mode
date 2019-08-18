# Kiosk mode

## Installation

Add `kiosk.js` file with the content below to your `www` folder in config.

Like any other custom script, use `ui-lovelace.yaml` resources section to reference the `kiosk.js` file.

Make sure you add `kiosk` somewhere in your URL. You can use it in the id of your view or in the query string.

Examples:

```
/lovelace/0?kiosk
```

```yaml
views:
  - title: Kiosk
    icon: mdi:heart
    id: kiosk_alarm
```

## Note

If this is your first file in `www` make sure you restart Home Assistant.
