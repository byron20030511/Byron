import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { FBXLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const galleryGrid = document.querySelector("#galleryGrid");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxClose = document.querySelector("#lightboxClose");
const pageAudio = document.querySelector("#pageAudio");
const audioToggle = document.querySelector("#audioToggle");
const floatingControls = document.querySelector(".floating-controls");
const floatingTopButton = document.querySelector("#floatingTopButton");
const floatingAudioToggle = document.querySelector("#floatingAudioToggle");
const floatingAudioText = document.querySelector(".floating-audio-text");
const heroMedia = document.querySelector("#heroMedia");
const hologramStage = document.querySelector("#hologramStage");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const artworks = [
  { file: "0-3.jpg", title: "Rain Archive", note: "A neon-soaked memory caught between transit and static." },
  { file: "1-1.jpg", title: "Midnight Platform", note: "Steel, distance, and the quiet pressure of departure." },
  { file: "1-8.jpg", title: "Signal Bloom", note: "Electric glow breaking across a compressed urban horizon." },
  { file: "1-ZR.jpg", title: "Zero Residue", note: "A portrait of light after motion has already passed." },
  { file: "10-5.jpg", title: "Afterline District", note: "Dense architecture softened by weather, reflection, and haze." },
  { file: "11-2.jpg", title: "Chrome Wake", note: "Hard surfaces lit as if the city is still half-dreaming." },
  { file: "11-8-1.jpg", title: "Ghost Circuit I", note: "First transmission from a corridor built for machines and memory." },
  { file: "11-8-2.jpg", title: "Ghost Circuit II", note: "A companion frame where atmosphere overtakes structure." },
  { file: "12-6-1.jpg", title: "Night Relay", note: "Signals crossing through fog, power lines, and sleepless glass." },
  { file: "16-7-2.jpg", title: "Synthetic Weather", note: "A study of environmental glow and engineered melancholy." },
  { file: "16-8.jpg", title: "Last Car Home", note: "Transit light receding into the blue hour of the city." },
  { file: "17-6-1.jpg", title: "Edge Terminal I", note: "An industrial threshold where movement becomes atmosphere." },
  { file: "17-6-2.jpg", title: "Edge Terminal II", note: "A second pass through the same structure, colder and quieter." },
  { file: "18-1.jpg", title: "Low Signal", note: "Muted illumination and the feeling of being almost unreachable." },
  { file: "18-2.jpg", title: "Passenger Memory", note: "A fleeting scene built around absence, motion, and reflected color." },
  { file: "18-6.jpg", title: "Voltage Garden", note: "A neon ecosystem emerging from cables, rain, and soft blur." },
  { file: "18-7.jpg", title: "Sleepless Block", note: "Compressed facades and windows holding scattered lives." },
  { file: "2-1.jpg", title: "Blue Transit", note: "A quiet urban rhythm framed through cool light and velocity." },
  { file: "2-8.jpg", title: "Signal Chamber", note: "Interior glow treated like a private weather system." },
  { file: "2-D.jpg", title: "Drift Code", note: "An image about erosion, data, and color as residue." },
  { file: "3-1.jpg", title: "Platform Echo", note: "Loneliness and repetition shaped by rail lines and neon depth." },
  { file: "5-6.jpg", title: "Afterimage Street", note: "A city fragment that lingers longer than the moment itself." },
  { file: "7-6.jpg", title: "Wire Cathedral", note: "Cables, structure, and light arranged like a digital shrine." },
  { file: "9-5.jpg", title: "Terminal Blue", note: "A closing scene held together by cold glow and distant motion." },
];

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
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

if (galleryGrid) {
  artworks.forEach((artwork, index) => {
    const article = document.createElement("article");
    article.className = "art-card";
    article.classList.add(index % 2 === 0 ? "slide-from-left" : "slide-from-right");
    article.tabIndex = 0;
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", `Open artwork ${artwork.title}`);

    const frame = document.createElement("div");
    frame.className = "art-frame";

    const image = document.createElement("img");
    image.src = `resources/image/${artwork.file}`;
    image.alt = artwork.title;
    image.loading = "lazy";

    const meta = document.createElement("div");
    meta.className = "art-meta";

    const label = document.createElement("p");
    label.className = "eyebrow";
    label.textContent = `${String(index + 1).padStart(2, "0")} / Selected work`;

    const title = document.createElement("h3");
    title.textContent = artwork.title;

    const description = document.createElement("p");
    description.textContent = artwork.note;

    frame.appendChild(image);
    meta.append(label, title, description);
    article.append(frame, meta);
    galleryGrid.appendChild(article);

    const openLightbox = () => {
      if (!lightbox || !lightboxImage || !lightboxCaption) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = `${artwork.title} / ${artwork.note}`;
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
  if (event.target instanceof HTMLDialogElement) {
    lightbox.close();
  }
});

const syncAudioToggle = () => {
  if (!pageAudio) return;

  const isPlaying = !pageAudio.paused;
  const awaitingPermission = pageAudio.paused && pageAudio.currentTime === 0;
  const label = isPlaying ? "Pause Audio" : awaitingPermission ? "Enable Audio" : "Play Audio";

  if (audioToggle) {
    audioToggle.textContent = label;
    audioToggle.setAttribute("aria-pressed", String(isPlaying));
    audioToggle.classList.toggle("is-playing", isPlaying);
  }

  if (floatingAudioToggle) {
    if (floatingAudioText) {
      floatingAudioText.textContent = label;
    } else {
      floatingAudioToggle.textContent = label;
    }
    floatingAudioToggle.setAttribute("aria-pressed", String(isPlaying));
    floatingAudioToggle.classList.toggle("is-playing", isPlaying);
    floatingAudioToggle.classList.toggle("is-awaiting", awaitingPermission && !isPlaying);
  }
};

const toggleAudioPlayback = async () => {
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
};

audioToggle?.addEventListener("click", toggleAudioPlayback);
floatingAudioToggle?.addEventListener("click", toggleAudioPlayback);
pageAudio?.addEventListener("play", syncAudioToggle);
pageAudio?.addEventListener("pause", syncAudioToggle);
pageAudio?.addEventListener("ended", syncAudioToggle);
syncAudioToggle();

const syncTopButtonVisibility = () => {
  if (!floatingControls) return;
  const shouldShow = window.scrollY > Math.max(520, window.innerHeight * 0.8);
  floatingControls.classList.toggle("show-top", shouldShow);
};

floatingTopButton?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  });
});

window.addEventListener("scroll", syncTopButtonVisibility, { passive: true });
syncTopButtonVisibility();

if (pageAudio && !prefersReducedMotion.matches) {
  window.addEventListener(
    "load",
    async () => {
      try {
        await pageAudio.play();
      } catch (error) {
        console.error("Autoplay was blocked.", error);
      } finally {
        syncAudioToggle();
      }
    },
    { once: true }
  );
}

if (!prefersReducedMotion.matches && heroMedia) {
  const updateHeroMedia = () => {
    const rect = heroMedia.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const clamped = Math.max(0, Math.min(1, progress));
    const y = (clamped - 0.5) * 14;
    heroMedia.style.transform = `translateY(${y}px)`;
  };

  window.addEventListener("scroll", updateHeroMedia, { passive: true });
  updateHeroMedia();
}

if (hologramStage) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(hologramStage.clientWidth, hologramStage.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  hologramStage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b1825, 8, 24);

  const camera = new THREE.PerspectiveCamera(
    32,
    hologramStage.clientWidth / hologramStage.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 2.6, 10);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 7.5;
  controls.maxDistance = 14;
  controls.minPolarAngle = Math.PI * 0.3;
  controls.maxPolarAngle = Math.PI * 0.72;
  controls.autoRotate = !prefersReducedMotion.matches;
  controls.autoRotateSpeed = 0.9;
  controls.target.set(0, 0.7, 0);
  controls.update();

  controls.addEventListener("start", () => {
    hologramStage.classList.add("is-dragging");
    controls.autoRotate = false;
  });

  controls.addEventListener("end", () => {
    hologramStage.classList.remove("is-dragging");
    if (!prefersReducedMotion.matches) {
      window.setTimeout(() => {
        controls.autoRotate = true;
      }, 1200);
    }
  });

  const hemiLight = new THREE.HemisphereLight(0x9af3ff, 0x061018, 2.3);
  const keyLight = new THREE.DirectionalLight(0x7cf2ff, 2.8);
  keyLight.position.set(5, 8, 6);
  const rimLight = new THREE.PointLight(0x45b8ff, 2.2, 30);
  rimLight.position.set(-4, 3, -3);
  scene.add(hemiLight, keyLight, rimLight);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.7, 0.3, 48, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x57dfff,
      transparent: true,
      opacity: 0.14,
      wireframe: true,
    })
  );
  pedestal.position.y = -2.7;
  scene.add(pedestal);

  const loader = new FBXLoader();
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  const hologramMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7cf2ff,
    emissive: 0x58d6ff,
    emissiveIntensity: 0.75,
    transparent: true,
    opacity: 0.42,
    roughness: 0.2,
    metalness: 0.05,
    transmission: 0.12,
    thickness: 0.4,
  });

  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xbef9ff,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });

  loader.load(
    "resources/3D/Eku.fbx",
    (fbx) => {
      const box = new THREE.Box3().setFromObject(fbx);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = 4.6 / maxAxis;

      fbx.scale.setScalar(scale);
      fbx.position.sub(center.multiplyScalar(scale));
      fbx.position.y -= 1.6;

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.material = hologramMaterial.clone();
          const wire = new THREE.Mesh(child.geometry, outlineMaterial.clone());
          child.add(wire);
        }
      });

      modelGroup.add(fbx);
    },
    undefined,
    (error) => {
      console.error("FBX load failed.", error);
    }
  );

  const resizeRenderer = () => {
    const { clientWidth, clientHeight } = hologramStage;
    renderer.setSize(clientWidth, clientHeight);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resizeRenderer);

  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();
    modelGroup.position.y = Math.sin(elapsed * 1.2) * 0.18;
    pedestal.rotation.y = elapsed * 0.16;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}
