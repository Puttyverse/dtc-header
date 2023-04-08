import { h } from "virtual-dom";
import { withPluginApi } from "discourse/lib/plugin-api";
import { wantsNewWindow } from "discourse/lib/intercept-click";
import DiscourseURL from "discourse/lib/url";

export default {
  name: "puttyverse-dtcz-header",

  initialize() {
    withPluginApi("0.8.20", (api) => {
      const customHeaderLinks = settings.Custom_header_links;

      const linksPosition =
        settings.links_position === "right"
          ? "header-buttons:before"
          : "home-logo:after";

      const headerLinks = [];

      customHeaderLinks
        .split("|")
        .filter(Boolean)
        .map((customHeaderLinksArray) => {
          const [linkText, linkTitle, linkHref, device, target, keepOnScroll, submenu] =
            customHeaderLinksArray
              .split(",")
              .filter(Boolean)
              .map((x) => x.trim());

          const deviceClass = `.${device}`;
          const linkTarget = target === "self" ? "" : "_blank";
          const keepOnScrollClass = keepOnScroll === "keep" ? ".keep" : "";
          const linkClass = `.${linkText
            .toLowerCase()
            .replace(/\s/gi, "-")}-custom-header-links`;

          const anchorAttributes = {
            title: linkTitle,
            href: linkHref,
          };
          if (linkTarget) {
            anchorAttributes.target = linkTarget;
          }
          let linkItem = h("a", anchorAttributes, linkText);

          if (submenu) {
            const subLinks = [];
            const subItems = submenu
              .split("#")
              .map((subItem) => {
                const [text, url] = subItem.split(";").map(x => x.trim());
                subLinks.push(h("li.sublink", h("a", {href: url}, text)));
              });
            linkItem = [h("ul.submenu", subLinks), linkItem];
          }

          headerLinks.push(
            h(`li.headerLink${deviceClass}${keepOnScrollClass}${linkClass}`, linkItem)
          );
        });

      api.decorateWidget(linksPosition, (helper) => {
        return helper.h("ul.custom-header-links", headerLinks);
      });

      api.decorateWidget("home-logo:after", (helper) => {
        const dHeader = document.querySelector(".d-header");

        if (!dHeader) {
          return;
        }

        const isTitleVisible = helper.attrs.minimized;
        if (isTitleVisible) {
          dHeader.classList.add("hide-menus");
        } else {
          dHeader.classList.remove("hide-menus");
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
          },
          html() {
            return h("div");
          }
        });
      }
    });
  },
};
