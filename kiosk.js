if (window.location.href.indexOf('kiosk') > 0)
    setTimeout(function () {
        try {
            const root = document.querySelector('home-assistant').shadowRoot;
            const main = root.querySelector('home-assistant-main').shadowRoot;
            const drawer_layout = main.querySelector('app-drawer-layout');
            const drawer = drawer_layout.querySelector('app-drawer');
            drawer_sidebar = drawer.querySelector('ha-sidebar').shadowRoot;
            const app_toolbar = drawer_sidebar.querySelector('app-toolbar');
            const pages = drawer_layout.querySelector('partial-panel-resolver').shadowRoot;
            const lovelace = pages.querySelector('ha-panel-lovelace').shadowRoot;
            const huiroot = lovelace.querySelector('hui-root').shadowRoot;
            const header = huiroot.querySelector('app-header');
            const toolbar = huiroot.querySelector('app-toolbar');
            if (window.location.href.indexOf('show_tabs') > 0) {
                toolbar.style.display = 'none';
            } else {
                header.style.display = 'none';
            }
            app_toolbar.querySelector('paper-icon-button').click();
            window.dispatchEvent(new Event('resize'));
        }
        catch (e) {
            console.log(e);
        }
    }, 200);