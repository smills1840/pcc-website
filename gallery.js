(function () {
  const CAT_LABELS = {
    garage: "Garage Floor",
    commercial: "Commercial",
    residential: "Residential",
    polished: "Polished Concrete",
    patio: "Patio & Pool Deck",
  };

  const FALLBACK_PROJECTS = [
    {
      title: "Radford 2-Car Garage Full-Flake System",
      location: "Radford, VA",
      category: "garage",
      images: [
        "assets/fairlawn-va-2-car-garage-epoxy-flake-1.webp",
        "assets/fairlawn-va-2-car-garage-epoxy-flake-2.webp",
        "assets/fairlawn-va-2-car-garage-epoxy-flake-cove-base.webp",
      ],
      description: "A new 2-car garage finished with a premium full-flake epoxy system and custom color blend.",
      date: "2026-04-24",
    },
    {
      title: "Full-Flake Garage Makeover",
      location: "Blacksburg, VA",
      category: "garage",
      images: ["assets/garage-hero.webp", "assets/garage-floor.webp"],
      description: "Diamond-ground concrete, full-broadcast flake, and a polyaspartic topcoat for a clean showroom finish.",
    },
    {
      title: "Industrial Facility High-Gloss Epoxy",
      location: "Roanoke, VA",
      category: "commercial",
      images: ["assets/commercial-hangar.webp", "assets/restaurant-kitchen.webp", "assets/laboratory.webp"],
      description: "Industrial-grade coating designed for traffic, chemical resistance, and easy maintenance.",
    },
    {
      title: "Retail Showroom Polished Concrete",
      location: "Blacksburg, VA",
      category: "polished",
      images: ["assets/polished-retail.webp", "assets/concrete-polishing.webp"],
      description: "Multi-stage diamond polishing for a reflective, durable, low-maintenance commercial surface.",
    },
    {
      title: "Pool Deck Coating",
      location: "Radford, VA",
      category: "residential",
      images: ["assets/patio-coating.webp"],
      description: "UV-stable flake coating with a slip-resistant texture for an outdoor pool deck.",
    },
    {
      title: "Basement Gym Moisture-Barrier System",
      location: "Christiansburg, VA",
      category: "residential",
      images: ["assets/basement-floor.webp"],
      description: "A damp basement converted into a durable home gym surface with a moisture-blocking epoxy system.",
    },
  ];

  const state = {
    projects: [],
    filter: "all",
    visibleProjects: [],
    projectIndex: 0,
    imageIndex: 0,
  };

  const grid = document.getElementById("gallery-grid");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  let lightbox;

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function normalizeAssetPath(src) {
    if (!src) return "";
    if (typeof src === "object" && src.photo) src = src.photo;
    src = String(src).trim();
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    return src.replace(/^\/+/, "");
  }

  function normalizeProject(project) {
    const images = Array.isArray(project.images) && project.images.length
      ? project.images
      : project.image
        ? [project.image]
        : [];

    return {
      title: project.title || "Untitled Project",
      location: project.location || "Southwest Virginia",
      category: project.category || "garage",
      description: project.description || "",
      featured: Boolean(project.featured),
      date: project.date || "",
      images: images.map(normalizeAssetPath).filter(Boolean),
    };
  }

  function isPlaceholderProject(project) {
    const values = [project.title, project.location, project.description]
      .map(value => String(value || "").trim().toLowerCase());
    return values.some(value => value === "test" || value === "placeholder");
  }

  function uniqueProjects(projects) {
    const seen = new Set();
    return projects.filter(project => {
      const key = `${project.title}|${project.location}`;
      const imageKey = project.images[0] || key;
      if (seen.has(imageKey)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      seen.add(imageKey);
      return true;
    });
  }

  function getVisibleProjects() {
    return state.filter === "all"
      ? state.projects
      : state.projects.filter(project => project.category === state.filter);
  }

  function buildCard(project, index) {
    const image = project.images[0] || "";
    const label = CAT_LABELS[project.category] || project.category;
    const photoLabel = project.images.length === 1 ? "1 photo" : `${project.images.length} photos`;

    return `
      <button type="button" class="gallery-card gallery-item" data-gallery-index="${index}" data-category="${escapeHtml(project.category)}" aria-label="View ${escapeHtml(project.title)}">
        <div class="gallery-card__image">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)} in ${escapeHtml(project.location)}" loading="lazy">
          <span class="gallery-pill">${escapeHtml(label)}</span>
          <span class="gallery-count">${escapeHtml(photoLabel)}</span>
        </div>
        <div class="gallery-card__body">
          <div class="gallery-location">
            <span class="material-symbols-outlined text-sm" aria-hidden="true">location_on</span>
            ${escapeHtml(project.location)}
          </div>
          <h3 class="gallery-card__title">${escapeHtml(project.title)}</h3>
          <p class="gallery-card__description">${escapeHtml(project.description)}</p>
          <span class="gallery-card__cta">View project <span class="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></span>
        </div>
      </button>
    `;
  }

  function renderGrid() {
    state.visibleProjects = getVisibleProjects();

    if (!state.visibleProjects.length) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-20 text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl block mb-3 text-outline" aria-hidden="true">photo_library</span>
          No projects in this category yet.
        </div>
      `;
      return;
    }

    grid.innerHTML = state.visibleProjects.map(buildCard).join("");
    grid.querySelectorAll("[data-gallery-index]").forEach(card => {
      card.addEventListener("click", () => openLightbox(Number(card.dataset.galleryIndex)));
    });
  }

  function setFilter(category) {
    state.filter = category;
    filterButtons.forEach(button => {
      const active = button.dataset.filter === category;
      button.className = active
        ? "filter-btn active-filter font-headline font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full border border-primary bg-primary text-on-primary transition-all"
        : "filter-btn font-headline font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full border border-white/20 text-white/70 hover:border-primary hover:text-primary transition-all";
      button.classList.toggle("active-filter", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderGrid();
  }

  function buildLightbox() {
    lightbox = document.createElement("div");
    lightbox.className = "project-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Project photo viewer");
    lightbox.innerHTML = `
      <div class="project-lightbox__media">
        <button type="button" class="project-lightbox__close" aria-label="Close project viewer">&times;</button>
        <button type="button" class="project-lightbox__nav project-lightbox__prev" aria-label="Previous photo">&#8249;</button>
        <img class="project-lightbox__image" alt="">
        <button type="button" class="project-lightbox__nav project-lightbox__next" aria-label="Next photo">&#8250;</button>
      </div>
      <aside class="project-lightbox__side">
        <div class="project-lightbox__counter"></div>
        <h2 class="project-lightbox__title"></h2>
        <div class="project-lightbox__location"></div>
        <p class="project-lightbox__description"></p>
        <div class="project-lightbox__thumbs" aria-label="Project photos"></div>
      </aside>
    `;
    document.body.appendChild(lightbox);
    lightbox.querySelector(".project-lightbox__close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".project-lightbox__prev").addEventListener("click", previousImage);
    lightbox.querySelector(".project-lightbox__next").addEventListener("click", nextImage);
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  function currentProject() {
    return state.visibleProjects[state.projectIndex];
  }

  function updateLightbox() {
    const project = currentProject();
    if (!project) return;
    const images = project.images.length ? project.images : [""];
    state.imageIndex = Math.max(0, Math.min(state.imageIndex, images.length - 1));

    lightbox.querySelector(".project-lightbox__image").src = images[state.imageIndex];
    lightbox.querySelector(".project-lightbox__image").alt = project.title;
    lightbox.querySelector(".project-lightbox__counter").textContent = `Photo ${state.imageIndex + 1} of ${images.length}`;
    lightbox.querySelector(".project-lightbox__title").textContent = project.title;
    lightbox.querySelector(".project-lightbox__location").textContent = project.location;
    lightbox.querySelector(".project-lightbox__description").textContent = project.description;

    const previous = lightbox.querySelector(".project-lightbox__prev");
    const next = lightbox.querySelector(".project-lightbox__next");
    const showArrows = images.length > 1;
    previous.style.display = showArrows ? "block" : "none";
    next.style.display = showArrows ? "block" : "none";

    lightbox.querySelector(".project-lightbox__thumbs").innerHTML = images.map((image, index) => `
      <button type="button" class="project-lightbox__thumb ${index === state.imageIndex ? "is-active" : ""}" data-thumb-index="${index}" aria-label="View photo ${index + 1}">
        <img src="${escapeHtml(image)}" alt="">
      </button>
    `).join("");

    lightbox.querySelectorAll("[data-thumb-index]").forEach(button => {
      button.addEventListener("click", () => {
        state.imageIndex = Number(button.dataset.thumbIndex);
        updateLightbox();
      });
    });
  }

  function openLightbox(projectIndex) {
    if (!lightbox) buildLightbox();
    state.projectIndex = projectIndex;
    state.imageIndex = 0;
    document.body.classList.add("gallery-open");
    lightbox.classList.add("is-open");
    updateLightbox();
    lightbox.querySelector(".project-lightbox__close").focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    document.body.classList.remove("gallery-open");
    lightbox.classList.remove("is-open");
  }

  function previousImage() {
    const project = currentProject();
    if (!project || project.images.length < 2) return;
    state.imageIndex = (state.imageIndex - 1 + project.images.length) % project.images.length;
    updateLightbox();
  }

  function nextImage() {
    const project = currentProject();
    if (!project || project.images.length < 2) return;
    state.imageIndex = (state.imageIndex + 1) % project.images.length;
    updateLightbox();
  }

  async function loadProjects() {
    let cmsProjects = [];
    try {
      if (location.protocol !== "file:") {
        const response = await fetch("/api/projects?t=" + Date.now());
        if (response.ok) cmsProjects = await response.json();
      }
    } catch {
      cmsProjects = [];
    }

    state.projects = uniqueProjects([
      ...cmsProjects.map(normalizeProject),
      ...FALLBACK_PROJECTS.map(normalizeProject),
    ]).filter(project => project.images.length && !isPlaceholderProject(project));

    renderGrid();
  }

  filterButtons.forEach(button => {
    button.dataset.filter = button.id.replace("filter-", "");
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  document.addEventListener("keydown", event => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") previousImage();
    if (event.key === "ArrowRight") nextImage();
  });

  window.filterGallery = setFilter;
  loadProjects();
})();
