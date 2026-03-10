const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".site-header");
const scrollTargetKey = "ecotech-scroll-target";

function updateHeaderOffset() {
  if (!siteHeader) {
    return 116;
  }

  const headerHeight = Math.ceil(siteHeader.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-offset", headerHeight + "px");
  return headerHeight;
}

function resolveScrollTarget(hash) {
  const target = document.querySelector(hash);

  if (!target) {
    return null;
  }

  if (target.classList.contains("section-anchor")) {
    const heading = target.parentElement ? target.parentElement.querySelector(".section-heading") : null;
    return heading || target.parentElement || target;
  }

  return target;
}

function scrollToSection(hash, replaceState = false, behavior = "smooth") {
  if (!hash) {
    return;
  }

  const target = resolveScrollTarget(hash);

  if (!target) {
    return;
  }

  const headerHeight = updateHeaderOffset();
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - 16);

  window.scrollTo({
    top,
    behavior
  });

  if (replaceState) {
    history.replaceState(null, "", hash);
  }
}

function closeMenu() {
  if (!topbar || !menuToggle) {
    return;
  }

  topbar.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function initMenu() {
  updateHeaderOffset();

  if (!topbar || !menuToggle) {
    document.querySelectorAll(".nav-links a[href*='#']").forEach((link) => {
      link.addEventListener("click", (event) => {
        const url = new URL(link.href, window.location.href);

        if (url.pathname === window.location.pathname && url.hash) {
          event.preventDefault();
          scrollToSection(url.hash, true);
          return;
        }

        if (url.hash) {
          event.preventDefault();
          sessionStorage.setItem(scrollTargetKey, url.hash);
          window.location.href = url.href.split("#")[0];
        }
      });
    });

    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, window.location.href);

      if (url.pathname === window.location.pathname && url.hash) {
        event.preventDefault();
        closeMenu();
        scrollToSection(url.hash, true);
        return;
      }

      if (url.hash) {
        event.preventDefault();
        closeMenu();
        sessionStorage.setItem(scrollTargetKey, url.hash);
        window.location.href = url.href.split("#")[0];
        return;
      }

      closeMenu();
    });
  });
}

function initTopicTransitions() {
  window.requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });
}

function markActivePage() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentHash = window.location.hash;
  const navLinks = document.querySelectorAll(".nav-links a");
  let activeLink = null;

  navLinks.forEach((link) => {
    const url = new URL(link.href, window.location.href);
    const targetPath = url.pathname.split("/").pop() || "index.html";

    if (targetPath === currentPath && url.hash && url.hash === currentHash) {
      activeLink = link;
    }
  });

  if (!activeLink) {
    navLinks.forEach((link) => {
      const url = new URL(link.href, window.location.href);
      const targetPath = url.pathname.split("/").pop() || "index.html";

      if (!activeLink && targetPath === currentPath) {
        activeLink = link;
      }
    });
  }

  if (activeLink) {
    activeLink.classList.add("active");
  }
}

function initMap() {
  const mapElement = document.getElementById("ecopontos-map");

  if (!mapElement || !window.L) {
    return;
  }

  const ecopontosAracatuba = [
    {
      name: "Ecoponto Lago Azul",
      address: "Av. Juscelino Kubitschek e Rua José Guerra",
      materials: "Entulho, recicláveis, móveis, eletrodomésticos, lâmpadas e baterias domésticas",
      lat: -21.2369994,
      lon: -50.4579689
    },
    {
      name: "Ecoponto Claudionor Cinti",
      address: "Av. Juscelino Kubitschek e Rua Adalberto da Cunha Capela",
      materials: "Entulho, recicláveis, móveis, eletrodomésticos, lâmpadas e baterias domésticas",
      lat: -21.2302376,
      lon: -50.4713378
    },
    {
      name: "Ecoponto São José",
      address: "Rua Rafael Manarelli e Rua Deodato Izique",
      materials: "Entulho, recicláveis, móveis, eletrodomésticos, lâmpadas e baterias domésticas",
      lat: -21.2001,
      lon: -50.474
    },
    {
      name: "Ecoponto Country",
      address: "Av. Odorindo Perenha, 2220",
      materials: "Entulho, recicláveis, móveis, eletrodomésticos, lâmpadas e baterias domésticas",
      lat: -21.2186112,
      lon: -50.4104048
    },
    {
      name: "Ecoponto Fundadores",
      address: "Av. dos Fundadores, 4783",
      materials: "Entulho, recicláveis, móveis, eletrodomésticos, lâmpadas e baterias domésticas",
      lat: -21.191059,
      lon: -50.4748018
    },
    {
      name: "PEV da Secretaria de Meio Ambiente",
      address: "Av. Doutor Alcides Fagundes Chagas, 222",
      materials: "Lâmpadas, baterias domésticas e recicláveis em pequenas quantidades",
      lat: -21.1981831,
      lon: -50.431116
    }
  ];

  const map = L.map("ecopontos-map", {
    scrollWheelZoom: false
  }).setView([-21.2087, -50.4456], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const bounds = [];

  ecopontosAracatuba.forEach((point) => {
    const marker = L.marker([point.lat, point.lon]).addTo(map);

    marker.bindPopup(
      "<strong>" + point.name + "</strong><br>" +
      point.address + "<br>" +
      point.materials
    );

    bounds.push([point.lat, point.lon]);
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [28, 28] });
  }
}

function syncInitialHashPosition() {
  const storedHash = sessionStorage.getItem(scrollTargetKey);
  const pendingHash = storedHash || window.location.hash;

  if (!pendingHash) {
    return;
  }

  if (storedHash) {
    sessionStorage.removeItem(scrollTargetKey);
  }

  const alignHash = () => {
    scrollToSection(pendingHash, Boolean(storedHash), "auto");
  };

  if (storedHash) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(alignHash);
  });
  window.addEventListener("load", alignHash, { once: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(alignHash);
  }
}

initMenu();
initTopicTransitions();
markActivePage();
initMap();
syncInitialHashPosition();

window.addEventListener("resize", updateHeaderOffset);
window.addEventListener("hashchange", () => {
  if (window.location.hash) {
    scrollToSection(window.location.hash, false, "auto");
  }
});
