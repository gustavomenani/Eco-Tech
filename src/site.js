const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".site-header");
const scrollTargetKey = "ecotech-scroll-target";
const mobileMenuBreakpoint = window.matchMedia("(max-width: 920px)");

function updateHeaderOffset() {
  if (!siteHeader) {
    return 116;
  }

  const headerHeight = Math.ceil(siteHeader.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-offset", `${headerHeight}px`);
  return headerHeight;
}

function getHashTargetId(hash) {
  if (!hash) {
    return "";
  }

  const normalized = hash.startsWith("#") ? hash.slice(1) : hash;

  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

function resolveScrollTarget(hash) {
  const targetId = getHashTargetId(hash);

  if (!targetId) {
    return null;
  }

  const target = document.getElementById(targetId);

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

function setMenuState(isOpen) {
  if (!topbar || !menuToggle) {
    return;
  }

  topbar.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu principal" : "Abrir menu principal");
  document.body.classList.toggle("menu-open", isOpen && mobileMenuBreakpoint.matches);
}

function closeMenu() {
  setMenuState(false);
}

function initMenu() {
  updateHeaderOffset();

  if (!topbar || !menuToggle) {
    return;
  }

  setMenuState(false);

  menuToggle.addEventListener("click", () => {
    setMenuState(!topbar.classList.contains("is-open"));
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

  document.addEventListener("click", (event) => {
    if (!mobileMenuBreakpoint.matches || !topbar.classList.contains("is-open")) {
      return;
    }

    if (topbar.contains(event.target)) {
      return;
    }

    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !topbar.classList.contains("is-open")) {
      return;
    }

    closeMenu();
    menuToggle.focus();
  });

  const handleBreakpointChange = (event) => {
    if (!event.matches) {
      closeMenu();
    }
  };

  if (typeof mobileMenuBreakpoint.addEventListener === "function") {
    mobileMenuBreakpoint.addEventListener("change", handleBreakpointChange);
  } else {
    mobileMenuBreakpoint.addListener(handleBreakpointChange);
  }
}

function markActivePage() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentHash = window.location.hash;
  const allLinks = Array.from(document.querySelectorAll(".nav-links a, .footer-nav a"));
  let activeKey = "";

  allLinks.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });

  const exactMatch = allLinks.find((link) => {
    const url = new URL(link.href, window.location.href);
    const targetPath = url.pathname.split("/").pop() || "index.html";
    return targetPath === currentPath && url.hash && url.hash === currentHash;
  });

  if (exactMatch) {
    const url = new URL(exactMatch.href, window.location.href);
    activeKey = `${url.pathname.split("/").pop() || "index.html"}${url.hash}`;
  } else {
    activeKey = `${currentPath}`;
  }

  allLinks.forEach((link) => {
    const url = new URL(link.href, window.location.href);
    const targetPath = url.pathname.split("/").pop() || "index.html";
    const linkKey = url.hash ? `${targetPath}${url.hash}` : targetPath;

    if (linkKey === activeKey) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setMapFallback(message) {
  const mapElement = document.getElementById("ecopontos-map");

  if (!mapElement) {
    return;
  }

  mapElement.innerHTML = `<p class="map-fallback">${escapeHtml(message)}</p>`;
}

function buildMaterialChipMarkup(labels, chipClass) {
  return labels.map((label) => `<span class="${chipClass}">${escapeHtml(label)}</span>`).join("");
}

function getEcopointsFromCards() {
  return Array.from(document.querySelectorAll(".ecopoint-card"))
    .map((element) => {
      const {
        address = "",
        hours = "",
        keywords = "",
        lat = "",
        lon = "",
        materialKeys = "",
        materialLabels = "",
        mapsUrl = "",
        materials = "",
        name = "",
        type = ""
      } = element.dataset;

      const parsedLat = Number.parseFloat(lat);
      const parsedLon = Number.parseFloat(lon);
      const parsedMaterialKeys = materialKeys.split("|").map((item) => item.trim()).filter(Boolean);
      const parsedMaterialLabels = materialLabels.split("|").map((item) => item.trim()).filter(Boolean);

      if (!name || !address || !materials || !hours || !mapsUrl || !Number.isFinite(parsedLat) || !Number.isFinite(parsedLon) || !parsedMaterialKeys.length || parsedMaterialKeys.length !== parsedMaterialLabels.length) {
        return null;
      }

      return {
        element,
        type,
        name,
        address,
        materials,
        hours,
        mapsUrl,
        materialKeys: parsedMaterialKeys,
        materialLabels: parsedMaterialLabels,
        keywords,
        lat: parsedLat,
        lon: parsedLon
      };
    })
    .filter(Boolean);
}

function normalizePoints(points) {
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lon);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const hasLatSpread = Math.abs(maxLat - minLat) > 0.0001;
  const hasLonSpread = Math.abs(maxLon - minLon) > 0.0001;
  const latRange = hasLatSpread ? maxLat - minLat : 1;
  const lonRange = hasLonSpread ? maxLon - minLon : 1;
  const padding = 12;

  return points.map((point, index) => {
    const x = hasLonSpread ? padding + ((point.lon - minLon) / lonRange) * (100 - padding * 2) : 50;
    const y = hasLatSpread ? padding + ((maxLat - point.lat) / latRange) * (100 - padding * 2) : 50;

    return {
      ...point,
      markerX: `${x.toFixed(2)}%`,
      markerY: `${y.toFixed(2)}%`,
      shortAddress: point.address.replace(/^Cruzamento entre /i, "")
    };
  });
}

function renderSchematicMap(points) {
  const mapElement = document.getElementById("ecopontos-map");

  if (!mapElement) {
    return;
  }

  if (!points.length) {
    setMapFallback("Nenhum ponto corresponde aos filtros atuais.");
    return;
  }

  const normalizedPoints = normalizePoints(points);
  const markersMarkup = normalizedPoints.map((point, index) => {
    return `
      <a
        class="map-marker"
        href="${escapeHtml(point.mapsUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        style="--x:${point.markerX}; --y:${point.markerY};"
        aria-label="${index + 1}. ${escapeHtml(point.name)}. Abrir localização no mapa."
      >
        <span class="marker-dot" aria-hidden="true">
          <span class="marker-number">${index + 1}</span>
        </span>
      </a>
    `;
  }).join("");

  const switcherMarkup = normalizedPoints.map((point, index) => {
    return `
      <button
        class="map-switcher-item"
        type="button"
        data-point-index="${index}"
        aria-pressed="false"
      >
        <span class="map-switcher-number" aria-hidden="true">${index + 1}</span>
        <span class="map-switcher-label">${escapeHtml(point.name.replace(/^Ecoponto\s+/i, "").replace(/^PEV\s+da\s+/i, ""))}</span>
      </button>
    `;
  }).join("");

  mapElement.innerHTML = `
    <figure class="schematic-map">
      <div class="schematic-map-canvas" aria-label="Posição relativa dos ecopontos de Araçatuba">
        ${markersMarkup}
      </div>
      <div class="map-focus-card" aria-live="polite">
        <p class="map-focus-eyebrow">Ponto em destaque</p>
        <strong class="map-focus-title"></strong>
        <p class="map-focus-address"></p>
        <p class="map-focus-meta"></p>
        <div class="map-focus-materials" aria-label="Materiais aceitos"></div>
        <a class="card-link map-focus-link" href="#" target="_blank" rel="noopener noreferrer">Abrir localização</a>
      </div>
      <div class="map-switcher" aria-label="Selecionar ponto em destaque">
        ${switcherMarkup}
      </div>
      <figcaption class="map-caption">Mapa esquemático baseado nas coordenadas dos ecopontos visíveis. Toque nos números ou use os botões abaixo para trocar o ponto em destaque.</figcaption>
    </figure>
  `;

  const markers = Array.from(mapElement.querySelectorAll(".map-marker"));
  const switcherItems = Array.from(mapElement.querySelectorAll(".map-switcher-item"));
  const focusTitle = mapElement.querySelector(".map-focus-title");
  const focusAddress = mapElement.querySelector(".map-focus-address");
  const focusMeta = mapElement.querySelector(".map-focus-meta");
  const focusMaterials = mapElement.querySelector(".map-focus-materials");
  const focusLink = mapElement.querySelector(".map-focus-link");
  let activeCard = null;

  function setActivePoint(index) {
    const point = normalizedPoints[index];

    if (!point || !focusTitle || !focusAddress || !focusMeta || !focusMaterials || !focusLink) {
      return;
    }

    markers.forEach((marker, markerIndex) => {
      marker.classList.toggle("is-active", markerIndex === index);
    });

    switcherItems.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (activeCard) {
      activeCard.classList.remove("is-map-active");
    }

    if (point.element) {
      point.element.classList.add("is-map-active");
      activeCard = point.element;
    }

    focusTitle.textContent = `${index + 1}. ${point.name}`;
    focusAddress.textContent = point.address;
    focusMeta.textContent = point.hours;
    focusMaterials.innerHTML = buildMaterialChipMarkup(point.materialLabels, "map-focus-material");
    focusLink.href = point.mapsUrl;
    focusLink.setAttribute("aria-label", `Abrir localização de ${point.name} no Google Maps`);
  }

  markers.forEach((marker, index) => {
    marker.addEventListener("mouseenter", () => {
      setActivePoint(index);
    });

    marker.addEventListener("focus", () => {
      setActivePoint(index);
    });
  });

  switcherItems.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number.parseInt(button.dataset.pointIndex || "-1", 10);
      setActivePoint(index);
    });
  });

  setActivePoint(0);
}

function buildRealMapEmbedUrl(point) {
  const latPadding = 0.012;
  const lonPadding = 0.018;
  const left = (point.lon - lonPadding).toFixed(6);
  const bottom = (point.lat - latPadding).toFixed(6);
  const right = (point.lon + lonPadding).toFixed(6);
  const top = (point.lat + latPadding).toFixed(6);
  const marker = `${point.lat.toFixed(6)}%2C${point.lon.toFixed(6)}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${marker}`;
}

function renderRealMap(points) {
  const mapElement = document.getElementById("ecopontos-map");

  if (!mapElement) {
    return;
  }

  if (!points.length) {
    setMapFallback("Nenhum ponto corresponde aos filtros atuais.");
    return;
  }

  if (points.some((point) => !Number.isFinite(point.lat) || !Number.isFinite(point.lon))) {
    renderSchematicMap(points);
    return;
  }

  const switcherMarkup = points.map((point, index) => {
    return `
      <button
        class="map-switcher-item"
        type="button"
        data-point-index="${index}"
        aria-pressed="false"
      >
        <span class="map-switcher-number" aria-hidden="true">${index + 1}</span>
        <span class="map-switcher-label">${escapeHtml(point.name.replace(/^Ecoponto\s+/i, "").replace(/^PEV\s+da\s+/i, ""))}</span>
      </button>
    `;
  }).join("");

  mapElement.innerHTML = `
    <figure class="real-map">
      <div class="map-real-shell">
        <iframe
          class="map-real-frame"
          title="Mapa real do ponto em destaque"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div class="map-real-note">
        <p class="map-focus-eyebrow">Mapa real</p>
        <p class="map-caption">Visualização do OpenStreetMap centrada no ponto selecionado. Se o mapa real não responder, o site volta automaticamente para a versão simplificada.</p>
        <p class="map-real-attribution">Base cartográfica OpenStreetMap.</p>
      </div>
      <div class="map-focus-card" aria-live="polite">
        <p class="map-focus-eyebrow">Ponto em destaque</p>
        <strong class="map-focus-title"></strong>
        <p class="map-focus-address"></p>
        <p class="map-focus-meta"></p>
        <div class="map-focus-materials" aria-label="Materiais aceitos"></div>
        <a class="card-link map-focus-link" href="#" target="_blank" rel="noopener noreferrer">Abrir localização</a>
      </div>
      <div class="map-switcher" aria-label="Selecionar ponto em destaque">
        ${switcherMarkup}
      </div>
    </figure>
  `;

  const mapFrame = mapElement.querySelector(".map-real-frame");
  const switcherItems = Array.from(mapElement.querySelectorAll(".map-switcher-item"));
  const focusTitle = mapElement.querySelector(".map-focus-title");
  const focusAddress = mapElement.querySelector(".map-focus-address");
  const focusMeta = mapElement.querySelector(".map-focus-meta");
  const focusMaterials = mapElement.querySelector(".map-focus-materials");
  const focusLink = mapElement.querySelector(".map-focus-link");
  let activeCard = null;
  let mapLoaded = false;

  const fallbackTimer = window.setTimeout(() => {
    if (!mapLoaded) {
      renderSchematicMap(points);
    }
  }, 4500);

  if (mapFrame) {
    mapFrame.addEventListener("load", () => {
      mapLoaded = true;
      window.clearTimeout(fallbackTimer);
    }, { once: true });
  }

  function setActivePoint(index) {
    const point = points[index];

    if (!point || !focusTitle || !focusAddress || !focusMeta || !focusMaterials || !focusLink || !mapFrame) {
      return;
    }

    switcherItems.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (activeCard) {
      activeCard.classList.remove("is-map-active");
    }

    if (point.element) {
      point.element.classList.add("is-map-active");
      activeCard = point.element;
    }

    focusTitle.textContent = `${index + 1}. ${point.name}`;
    focusAddress.textContent = point.address;
    focusMeta.textContent = point.hours;
    focusMaterials.innerHTML = buildMaterialChipMarkup(point.materialLabels, "map-focus-material");
    focusLink.href = point.mapsUrl;
    focusLink.setAttribute("aria-label", `Abrir localização de ${point.name} no Google Maps`);
    mapFrame.src = buildRealMapEmbedUrl(point);
    mapFrame.title = `Mapa real de ${point.name}`;
  }

  switcherItems.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number.parseInt(button.dataset.pointIndex || "-1", 10);
      setActivePoint(index);
    });
  });

  setActivePoint(0);
}

function updateEcopointsStatus(visibleCount, totalCount, activeMaterialLabel = "") {
  const statusElement = document.getElementById("ecopoints-status");

  if (!statusElement) {
    return;
  }

  if (!totalCount) {
    statusElement.textContent = "Nenhum ponto de descarte foi encontrado na base atual.";
    return;
  }

  if (!visibleCount) {
    statusElement.textContent = activeMaterialLabel
      ? `Nenhum ponto corresponde aos filtros atuais para ${activeMaterialLabel.toLowerCase()}.`
      : "Nenhum ponto corresponde aos filtros atuais. Tente outro termo ou escolha outro tipo de ponto.";
    return;
  }

  if (visibleCount === totalCount) {
    statusElement.textContent = activeMaterialLabel
      ? `${visibleCount} pontos aceitam ${activeMaterialLabel.toLowerCase()} em Araçatuba-SP.`
      : `${visibleCount} pontos disponíveis para descarte em Araçatuba-SP.`;
    return;
  }

  statusElement.textContent = activeMaterialLabel
    ? `${visibleCount} de ${totalCount} pontos correspondem aos filtros atuais para ${activeMaterialLabel.toLowerCase()}.`
    : `${visibleCount} de ${totalCount} pontos correspondem aos filtros atuais.`;
}

function initEcopointsPage() {
  const mapElement = document.getElementById("ecopontos-map");

  if (!mapElement) {
    return;
  }

  const ecopoints = getEcopointsFromCards();
  const searchInput = document.getElementById("ecopoints-search");
  const typeSelect = document.getElementById("ecopoints-type");
  const materialsToolbar = document.getElementById("ecopoints-materials");

  if (!ecopoints.length) {
    updateEcopointsStatus(0, 0);
    setMapFallback("Não foi possível carregar os pontos de descarte agora.");
    return;
  }

  const materialOptions = new Map();
  ecopoints.forEach((point) => {
    point.materialKeys.forEach((key, index) => {
      if (!materialOptions.has(key)) {
        materialOptions.set(key, point.materialLabels[index]);
      }
    });
  });

  let activeMaterial = "all";

  function renderMaterialToolbar() {
    if (!materialsToolbar || !materialOptions.size) {
      return;
    }

    const optionsMarkup = [
      '<button class="material-chip is-active" type="button" data-material-key="all" aria-pressed="true">Todos os materiais</button>',
      ...Array.from(materialOptions.entries()).map(([key, label]) => (
        `<button class="material-chip" type="button" data-material-key="${escapeHtml(key)}" aria-pressed="false">${escapeHtml(label)}</button>`
      ))
    ].join("");

    materialsToolbar.innerHTML = optionsMarkup;

    materialsToolbar.querySelectorAll(".material-chip").forEach((button) => {
      button.addEventListener("click", () => {
        activeMaterial = button.dataset.materialKey || "all";
        materialsToolbar.querySelectorAll(".material-chip").forEach((item) => {
          const isActive = item.dataset.materialKey === activeMaterial;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });
        applyFilters();
      });
    });
  }

  function applyFilters() {
    const query = normalizeText(searchInput ? searchInput.value : "");
    const type = typeSelect ? typeSelect.value : "all";
    const activeMaterialLabel = activeMaterial === "all" ? "" : materialOptions.get(activeMaterial) || "";
    let visibleCount = 0;

    ecopoints.forEach((point) => {
      const matchesQuery = !query || normalizeText(point.keywords).includes(query);
      const matchesType = type === "all" || point.type === type;
      const matchesMaterial = activeMaterial === "all" || point.materialKeys.includes(activeMaterial);
      const isVisible = matchesQuery && matchesType && matchesMaterial;

      point.element.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }
    });

    updateEcopointsStatus(visibleCount, ecopoints.length, activeMaterialLabel);
    renderRealMap(ecopoints.filter((point) => !point.element.hidden));
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", applyFilters);
  }

  renderMaterialToolbar();
  applyFilters();
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
markActivePage();
initEcopointsPage();
syncInitialHashPosition();

window.addEventListener("resize", () => {
  updateHeaderOffset();

  if (!mobileMenuBreakpoint.matches) {
    closeMenu();
  }
});

window.addEventListener("hashchange", () => {
  if (window.location.hash) {
    scrollToSection(window.location.hash, false, "auto");
  }
});
