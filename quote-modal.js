(function () {
  const quoteUrl = "https://prestigeconcretecoatings.dripjobs.com?f=new-form5987";
  let modal;
  let frame;
  let closeButton;
  let lastFocus;
  let lockedScrollY = 0;

  function setModalPosition() {
    if (!modal) return;
    const viewport = window.visualViewport;
    const top = viewport ? viewport.pageTop : window.scrollY;
    const height = viewport ? viewport.height : window.innerHeight;
    modal.style.setProperty("--quote-modal-top", `${Math.max(0, top)}px`);
    modal.style.setProperty("--quote-modal-height", `${Math.max(320, height)}px`);
  }

  function buildModal() {
    modal = document.createElement("div");
    modal.className = "quote-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "quote-modal-title");
    modal.innerHTML = `
      <div class="quote-modal__panel">
        <div class="quote-modal__bar">
          <div>
            <p id="quote-modal-title" class="quote-modal__title">Start Your Free Quote</p>
            <p class="quote-modal__hint">Complete the secure DripJobs form, then close this window to return to the page.</p>
          </div>
          <div class="quote-modal__actions">
            <button type="button" class="quote-modal__close" aria-label="Close quote form">&times;</button>
          </div>
        </div>
        <div class="quote-modal__frame-wrap">
          <div class="quote-modal__loading">Loading secure quote form...</div>
          <iframe class="quote-modal__frame" title="Prestige Concrete Coatings quote form" loading="lazy"></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    frame = modal.querySelector(".quote-modal__frame");
    closeButton = modal.querySelector(".quote-modal__close");

    closeButton.addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
    frame.addEventListener("load", function () {
      const loader = modal.querySelector(".quote-modal__loading");
      if (loader) loader.style.display = "none";
    });
  }

  function openModal(event) {
    event.preventDefault();
    if (!modal) buildModal();
    lastFocus = document.activeElement;
    lockedScrollY = window.scrollY;
    setModalPosition();
    window.scrollTo({ top: lockedScrollY, left: window.scrollX, behavior: "auto" });
    document.documentElement.classList.add("quote-modal-open");
    document.body.classList.add("quote-modal-open");
    modal.classList.add("is-open");
    modal.querySelector(".quote-modal__loading").style.display = "grid";
    frame.src = quoteUrl;
    closeButton.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.documentElement.classList.remove("quote-modal-open");
    document.body.classList.remove("quote-modal-open");
    frame.src = "about:blank";
    window.scrollTo({ top: lockedScrollY, left: window.scrollX, behavior: "auto" });
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest(`a[href="${quoteUrl}"]`);
    if (link) openModal(event);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  window.addEventListener("resize", setModalPosition);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setModalPosition);
    window.visualViewport.addEventListener("scroll", setModalPosition);
  }
})();
