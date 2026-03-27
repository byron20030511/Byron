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
