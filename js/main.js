(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector("#nav-mobile");
  const yearEls = document.querySelectorAll("[data-year]");
  const glow = document.querySelector(".cursor-glow");
  const navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');
  const sections = [...document.querySelectorAll("main section[id]")];

  yearEls.forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Social links from config — only activate when URL is provided */
  const social = (window.SIXHEAVEN && window.SIXHEAVEN.social) || {};
  document.querySelectorAll("[data-social]").forEach((el) => {
    const key = el.getAttribute("data-social");
    const url = social[key];
    if (url) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      el.classList.add("is-live");
      el.removeAttribute("aria-disabled");
      const cta = el.querySelector(".social-cta");
      if (cta) cta.textContent = "Ouvrir";
    }
  });

  /* Sticky header */
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* Mobile nav */
  const setMenuOpen = (open) => {
    if (!header || !toggle || !mobileNav) return;
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    mobileNav.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle?.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("is-open"));
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  /* Active section in nav */
  const updateActiveNav = () => {
    const y = window.scrollY + 120;
    let current = sections[0]?.id;
    for (const section of sections) {
      if (section.offsetTop <= y) current = section.id;
    }
    navLinks.forEach((link) => {
      const id = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", id === current);
    });
  };
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* Reveal on scroll */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const reveals = document.querySelectorAll("[data-reveal]");
    reveals.forEach((el, i) => {
      const delay = Math.min((i % 4) * 80, 240);
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  /* Cursor glow (desktop only) */
  if (!reduceMotion && glow && window.matchMedia("(pointer: fine)").matches) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        document.body.classList.add("is-pointer");
        tx = e.clientX;
        ty = e.clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        document.body.classList.remove("is-pointer");
      },
      { passive: true }
    );

    raf = requestAnimationFrame(tick);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    });
  }

  /* Subtle parallax on hero orbs */
  if (!reduceMotion) {
    const orbs = document.querySelectorAll(".hero-orb");
    if (orbs.length) {
      window.addEventListener(
        "scroll",
        () => {
          const p = Math.min(window.scrollY / 600, 1);
          orbs.forEach((orb, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            orb.style.translate = `0 ${p * 40 * dir}px`;
          });
        },
        { passive: true }
      );
    }
  }
})();
