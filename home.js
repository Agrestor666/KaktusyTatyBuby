/**
 * Strona główna — offset nagłówka, modale, formularz kontaktowy + Turnstile.
 */
(function initHeaderOffset() {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  if (!header) return;

  const setOffset = () => {
    const h = Math.ceil(header.getBoundingClientRect().height);
    root.style.setProperty("--header-offset", `${h}px`);
  };

  const schedule = () => requestAnimationFrame(setOffset);

  window.addEventListener("load", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  schedule();
})();

(function initModals() {
  const openBtns = document.querySelectorAll("[data-modal-target]");
  const modals = document.querySelectorAll(".modal[id]");
  if (!openBtns.length || !modals.length) return;

  let activeModal = null;
  let lastActive = null;

  const getFocusable = (modal) =>
    Array.from(
      modal.querySelectorAll(
        "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

  const open = (modal) => {
    if (activeModal && activeModal !== modal) close();
    lastActive = document.activeElement;
    activeModal = modal;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    const panel = modal.querySelector(".modal__panel");
    const focusables = getFocusable(modal);
    (focusables[0] || panel || modal).focus?.();
  };

  const close = () => {
    if (!activeModal) return;
    activeModal.hidden = true;
    activeModal = null;
    document.body.classList.remove("modal-open");
    if (lastActive && lastActive.focus) lastActive.focus();
  };

  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-modal-target");
      if (!id) return;
      const modal = document.getElementById(id);
      if (modal) open(modal);
    });
  });

  modals.forEach((modal) => {
    modal.querySelectorAll("[data-modal-close='true']").forEach((el) => el.addEventListener("click", close));

    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-modal-close='true']")) close();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (!activeModal || activeModal.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;

    const focusables = getFocusable(activeModal);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

(function initContactForm() {
  const form = document.getElementById("contactForm");
  const contactModal = document.getElementById("contactModal");
  const turnstileHost = document.getElementById("turnstileWidget");
  if (!(form instanceof HTMLFormElement) || !turnstileHost) return;

  const emailInput = document.getElementById("contactEmail");
  const msgInput = document.getElementById("contactMessage");
  if (!(emailInput instanceof HTMLInputElement) || !(msgInput instanceof HTMLTextAreaElement)) return;

  const statusEl = document.getElementById("contactStatus");
  const setStatus = (text, tone) => {
    if (!(statusEl instanceof HTMLElement)) return;
    statusEl.textContent = text;
    statusEl.dataset.tone = tone || "";
  };

  const submitBtn = form.querySelector("button[type='submit']");
  const setBusy = (busy) => {
    if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = !!busy;
    form.setAttribute("aria-busy", busy ? "true" : "false");
  };

  let turnstileWidgetId = null;
  let turnstileRenderPromise = null;

  const siteKeyRaw = form.getAttribute("data-turnstile-sitekey") || "";
  const siteKeyOk =
    siteKeyRaw.length >= 20 && !/PASTE_|YOUR_|PLACEHOLDER/i.test(siteKeyRaw);

  const waitTurnstile = () =>
    new Promise((resolve) => {
      if (window.turnstile) {
        resolve();
        return;
      }
      let n = 0;
      const t = window.setInterval(() => {
        n += 1;
        if (window.turnstile) {
          window.clearInterval(t);
          resolve();
        } else if (n > 200) {
          window.clearInterval(t);
          resolve();
        }
      }, 50);
    });

  const ensureTurnstile = () => {
    if (!siteKeyOk) return Promise.resolve();
    if (turnstileWidgetId !== null) return Promise.resolve();
    if (turnstileRenderPromise) return turnstileRenderPromise;

    turnstileRenderPromise = waitTurnstile().then(() => {
      if (!window.turnstile || turnstileWidgetId !== null) return;
      turnstileWidgetId = window.turnstile.render(turnstileHost, {
        sitekey: siteKeyRaw,
        theme: "light",
      });
    });

    return turnstileRenderPromise;
  };

  if (contactModal) {
    const obs = new MutationObserver(() => {
      if (contactModal.hidden) return;
      void ensureTurnstile();
    });
    obs.observe(contactModal, { attributes: true, attributeFilter: ["hidden"] });
  }

  const getTurnstileToken = () => {
    if (turnstileWidgetId === null || !window.turnstile) return "";
    try {
      return window.turnstile.getResponse(turnstileWidgetId) || "";
    } catch {
      return "";
    }
  };

  const resetTurnstile = () => {
    if (turnstileWidgetId === null || !window.turnstile) return;
    try {
      window.turnstile.reset(turnstileWidgetId);
    } catch {
      /* ignore */
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!siteKeyOk) {
      setStatus(
        "Wklej Site Key Turnstile (atrybut data-turnstile-sitekey na formularzu kontaktowym).",
        "error"
      );
      return;
    }

    const from = emailInput.value.trim();
    const message = msgInput.value.trim();
    if (!from || !message) {
      setStatus("Uzupełnij e-mail i wiadomość.", "error");
      return;
    }

    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot instanceof HTMLInputElement && honeypot.value.trim() !== "") {
      setStatus("Wysłano. Dziękujemy!", "success");
      form.reset();
      resetTurnstile();
      return;
    }

    const url = form.action;
    if (!url || !url.startsWith("https://hook.")) {
      setStatus("Brak poprawnego adresu webhooka (Make).", "error");
      return;
    }

    void ensureTurnstile().then(() => {
      const token = getTurnstileToken();
      if (!token) {
        setStatus("Zaznacz weryfikację Cloudflare (pole powyżej przycisku Wyślij).", "error");
        return;
      }

      setBusy(true);
      setStatus("Wysyłanie…", "info");

      const body = new URLSearchParams();
      body.set("email", from);
      body.set("message", message);
      body.set("cf-turnstile-response", token);

      fetch(url, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
        .then(async (res) => {
          const raw = await res.text();
          const rawTrim = raw.trimStart();
          const looksLikeHtml =
            rawTrim.startsWith("<!doctype") ||
            rawTrim.startsWith("<!DOCTYPE") ||
            rawTrim.startsWith("<html") ||
            rawTrim.startsWith("<HTML");

          if (!res.ok) {
            const details =
              (looksLikeHtml ? "Serwer zwrócił HTML (sprawdź URL webhooka w Make)." : "") ||
              (raw && raw.slice(0, 140)) ||
              `HTTP ${res.status}`;
            throw new Error(details.trim() || `HTTP ${res.status}`);
          }
          setStatus("Wysłano. Dziękujemy!", "success");
          form.reset();
          resetTurnstile();
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : "Nie udało się wysłać.";
          const hint =
            msg === "Failed to fetch"
              ? " (prawdopodobnie blokada CORS w przeglądarce — w Make włącz obsługę CORS dla webhooka lub użyj scenariusza z odpowiedzią z nagłówkiem Access-Control-Allow-Origin.)"
              : "";
          setStatus(`Nie udało się wysłać: ${msg}${hint}`, "error");
          resetTurnstile();
        })
        .finally(() => setBusy(false));
    });
  });
})();
