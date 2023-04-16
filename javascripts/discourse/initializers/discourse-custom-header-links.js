import { h } from "virtual-dom";
import { withPluginApi } from "discourse/lib/plugin-api";
import { wantsNewWindow } from "discourse/lib/intercept-click";
import DiscourseURL from "discourse/lib/url";

export default {
  name: "puttyverse-dtcz-header",

  initialize() {
    withPluginApi("0.8.20", (api) => {
      const linksSetting = settings.header_links;

      const linksPosition =
        settings.links_position === "right"
          ? "header-buttons:before"
          : "home-logo:after";


      const customHeaderLinks = JSON.parse(linksSetting);

      const headerLinks = customHeaderLinks.map((customHeaderLink) => {
        const linkClass = `.${customHeaderLink.linkText
          .toLowerCase()
          .replace(/\s/gi, "-")}-custom-header-links`;

        const anchorAttributes = { href: customHeaderLink.url };

        let linkItem = h("a", anchorAttributes, customHeaderLink.linkText);

        if (customHeaderLink.submenu && customHeaderLink.submenu != "") {
          const subLinks = customHeaderLink.submenu
            .split("#")
            .map((subItem) => {
              const [text, url] = subItem.split(";").map(x => x.trim());
              return h("li.sublink", h("a", {href: url}, text));
            });
          linkItem = [h("ul.submenu", subLinks), linkItem];
        }

        return h(`li.headerLink.vdo${linkClass}`, linkItem);
      });

      api.decorateWidget(linksPosition, (helper) => {
        return helper.h("ul.custom-header-links", headerLinks);
      });

      api.decorateWidget("home-logo:after", (helper) => {
        const bHeader = document.querySelector(".brand-header");
        const dHeader = document.querySelector(".d-header");
        const dHeaderWrap = document.querySelector(".d-header-wrap");

        if (!dHeader) {
          return;
        }

        const isTitleVisible = helper.attrs.minimized;
        if (isTitleVisible) {
          dHeader.classList.add("hide-menus");
          bHeader.classList.add("hide-menus");
          dHeaderWrap.classList.add("hide-menus");
        } else {
          dHeader.classList.remove("hide-menus");
          bHeader.classList.remove("hide-menus");
          dHeaderWrap.classList.remove("hide-menus");
        }
      });

      api.reopenWidget("home-logo", {
        html() {
          if (this.attrs.minimized) {
            return h(
              "a",
              { attributes: { href: settings.forum_url, "data-auto-route": true } },
              h('img#brand-logo.logo-big', { key: 'logo-big', attributes: { src: settings.logo_url } })
            );
          } else {
            return h('span', {}, '');
          }
        }
      });

      if (settings.links_position === "left") {
        // if links are aligned left, we need to be able to open in a new tab
        api.reopenWidget("home-logo", {
          click(e) {
            if (e.target.id === "site-logo") {
              if (wantsNewWindow(e)) {
                return false;
              }
              e.preventDefault();

              DiscourseURL.routeToTag($(e.target).closest("a")[0]);

              return false;
            }
          }
        });
      }
    });
  },
};
