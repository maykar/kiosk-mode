if (window.location.href.indexOf('kiosk') > 0)
    setTimeout(function () {
        try {
            const root = document.querySelector('home-assistant').shadowRoot;
            const main = root.querySelector('home-assistant-main').shadowRoot;
            const drawer = main.querySelector('app-drawer-layout');
            const pages = drawer.querySelector('partial-panel-resolver').shadowRoot;
            const lovelace = pages.querySelector('ha-panel-lovelace').shadowRoot;
            const huiroot = lovelace.querySelector('hui-root').shadowRoot;
            const header = huiroot.querySelector('app-header');
            header.style.display = 'none';
            window.dispatchEvent(new Event('resize'));
        }
        catch (e) {
            console.log(e);
        }
    }, 500);