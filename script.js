const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const tickerTrack = document.querySelector(".ticker-track");
const galleryGrid = document.querySelector("#galleryGrid");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxClose = document.querySelector("#lightboxClose");
const pageAudio = document.querySelector("#pageAudio");
const audioToggle = document.querySelector("#audioToggle");
const bootOverlay = document.querySelector("#bootOverlay");
const heroSection = document.querySelector("#heroSection");
const parallaxLayers = document.querySelectorAll(".parallax-layer");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const imageFiles = [
  "0-3.jpg",
  "1-1.jpg",
  "1-8.jpg",
  "1-ZR.jpg",
  "10-5.jpg",
  "11-2.jpg",
  "11-8-1.jpg",
  "11-8-2.jpg",
  "12-6-1.jpg",
  "16-7-2.jpg",
  "16-8.jpg",
  "17-6-1.jpg",
  "17-6-2.jpg",
  "18-1.jpg",
  "18-2.jpg",
  "18-6.jpg",
  "18-7.jpg",
  "2-1.jpg",
  "2-8.jpg",
  "2-D.jpg",
  "3-1.jpg",
  "5-6.jpg",
  "7-6.jpg",
  "9-5.jpg",
];

const finishBootSequence = () => {
  document.body.classList.add("is-ready");
  document.body.classList.remove("is-booting");

  if (bootOverlay) {
    bootOverlay.classList.add("is-hidden");
    window.setTimeout(() => {
      bootOverlay.remove();
    }, 800);
  }
};

if (prefersReducedMotion.matches) {
  finishBootSequence();
} else {
  window.setTimeout(finishBootSequence, 1800);
}

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header?.classList.remove("menu-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item) => observer.observe(item));

if (tickerTrack) {
  const clone = tickerTrack.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  tickerTrack.parentElement?.append(clone);
}

if (galleryGrid) {
  imageFiles.forEach((fileName, index) => {
    const article = document.createElement("article");
    article.className = "art-card";
    article.classList.add(index % 2 === 0 ? "slide-from-left" : "slide-from-right");
    article.tabIndex = 0;
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", `Open artwork ${fileName}`);

    const frame = document.createElement("div");
    frame.className = "art-frame";

    const image = document.createElement("img");
    image.src = `resources/image/${fileName}`;
    image.alt = `Artwork ${fileName}`;
    image.loading = "lazy";

    const meta = document.createElement("div");
    meta.className = "art-meta";

    const label = document.createElement("p");
    label.className = "card-label";
    label.textContent = `${String(index + 1).padStart(2, "0")} / Archive node`;

    const title = document.createElement("h3");
    title.textContent = fileName.replace(".jpg", "");

    const description = document.createElement("p");
    description.textContent = `Local asset loaded from resources/image/${fileName}`;

    frame.appendChild(image);
    meta.append(label, title, description);
    article.append(frame, meta);
    galleryGrid.appendChild(article);

    const openLightbox = () => {
      if (!lightbox || !lightboxImage || !lightboxCaption) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = fileName;
      lightbox.showModal();
    };

    article.addEventListener("click", openLightbox);
    article.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox();
      }
    });

    observer.observe(article);
  });
}

lightboxClose?.addEventListener("click", () => {
  lightbox?.close();
});

lightbox?.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLDialogElement) {
    lightbox.close();
  }
});

const syncAudioToggle = () => {
  if (!audioToggle || !pageAudio) return;

  const isPlaying = !pageAudio.paused;
  audioToggle.textContent = isPlaying ? "Pause Music" : "Play Music";
  audioToggle.setAttribute("aria-pressed", String(isPlaying));
  audioToggle.classList.toggle("is-playing", isPlaying);
};

audioToggle?.addEventListener("click", async () => {
  if (!pageAudio) return;

  if (pageAudio.paused) {
    try {
      await pageAudio.play();
    } catch (error) {
      console.error("Audio playback failed.", error);
    }
  } else {
    pageAudio.pause();
  }
});

pageAudio?.addEventListener("play", syncAudioToggle);
pageAudio?.addEventListener("pause", syncAudioToggle);
pageAudio?.addEventListener("ended", syncAudioToggle);

syncAudioToggle();

if (!prefersReducedMotion.matches && heroSection) {
  const updateHeroParallax = () => {
    const rect = heroSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const clamped = Math.max(0, Math.min(1, progress));
    const drift = (clamped - 0.5) * 30;

    parallaxLayers.forEach((layer) => {
      const depth = Number(layer.getAttribute("data-depth") || 0);
      const pointerX = Number(layer.getAttribute("data-pointer-x") || 0);
      const pointerY = Number(layer.getAttribute("data-pointer-y") || 0);
      layer.style.transform = `translate3d(${pointerX + drift * (depth / 20)}px, ${pointerY}px, 0)`;
    });
  };

  const updatePointerParallax = (event) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (event.clientX - centerX) / centerX;
    const offsetY = (event.clientY - centerY) / centerY;

    document.body.classList.add("is-pointer-active");
    document.body.style.setProperty("--pointer-x", `${offsetX * 18}px`);
    document.body.style.setProperty("--pointer-y", `${offsetY * 18}px`);

    parallaxLayers.forEach((layer) => {
      const depth = Number(layer.getAttribute("data-depth") || 0);
      layer.setAttribute("data-pointer-x", (offsetX * depth).toFixed(2));
      layer.setAttribute("data-pointer-y", (offsetY * depth * 0.55).toFixed(2));
    });

    updateHeroParallax();
  };

  window.addEventListener("scroll", updateHeroParallax, { passive: true });
  window.addEventListener("mousemove", updatePointerParallax, { passive: true });
  window.addEventListener("mouseleave", () => {
    document.body.classList.remove("is-pointer-active");
    document.body.style.setProperty("--pointer-x", "0px");
    document.body.style.setProperty("--pointer-y", "0px");

    parallaxLayers.forEach((layer) => {
      layer.setAttribute("data-pointer-x", "0");
      layer.setAttribute("data-pointer-y", "0");
    });

    updateHeroParallax();
  });

  updateHeroParallax();
}
