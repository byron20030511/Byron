import * as THREE from "./vendor/three/three.module.js";
import { GLTFLoader } from "./vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";
import { VRMLoaderPlugin, VRMUtils } from "./vendor/three-vrm.module.js";

const header = document.querySelector(".site-header");
const customCursor = document.querySelector("#customCursor");
const pageLoader = document.querySelector("#pageLoader");
const pageLoaderText = document.querySelector("#pageLoaderText");
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
const hologramStatus = document.querySelector("#hologramStatus");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
let pageReady = false;
let modelSettled = !hologramStage;

document.body.classList.add("is-loading");

const updateLoaderText = (message) => {
  if (pageLoaderText) {
    pageLoaderText.textContent = message;
  }
};

const hidePageLoader = () => {
  if (!pageReady || !modelSettled || !pageLoader) return;
  pageLoader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
};

const syncLightboxCursorState = () => {
  document.body.classList.toggle("lightbox-open", Boolean(lightbox?.open));
};

const setPointerOrigin = (event) => {
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  const rect = target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  target.style.setProperty("--pointer-x", `${x}%`);
  target.style.setProperty("--pointer-y", `${y}%`);
};

const updateCustomCursor = (event) => {
  if (!customCursor || !supportsFinePointer) return;
  customCursor.style.left = `${event.clientX}px`;
  customCursor.style.top = `${event.clientY}px`;
};

const setCustomCursorActive = (isActive) => {
  if (!customCursor || !supportsFinePointer) return;
  customCursor.classList.toggle("is-active", isActive);
};

window.addEventListener(
  "load",
  () => {
    pageReady = true;
    hidePageLoader();
  },
  { once: true }
);

if (customCursor && supportsFinePointer) {
  window.addEventListener("pointermove", (event) => {
    customCursor.classList.add("is-visible");
    updateCustomCursor(event);
  });

  window.addEventListener("pointerdown", () => {
    setCustomCursorActive(true);
  });

  window.addEventListener("pointerup", () => {
    setCustomCursorActive(false);
  });

  document.addEventListener("mouseleave", () => {
    customCursor.classList.remove("is-visible");
    setCustomCursorActive(false);
  });

  document.querySelectorAll("a, button, .art-card, .lightbox-close").forEach((item) => {
    item.addEventListener("pointerenter", () => {
      setCustomCursorActive(true);
    });

    item.addEventListener("pointerleave", () => {
      setCustomCursorActive(false);
    });
  });
}

window.setTimeout(() => {
  pageReady = true;
  modelSettled = true;
  updateLoaderText("Opening board...");
  hidePageLoader();
}, 9000);

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

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });
});

document.querySelectorAll(".button, .art-card, .site-nav a").forEach((item) => {
  item.addEventListener("pointermove", setPointerOrigin);
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
revealItems.forEach((item, index) => {
  item.style.setProperty("--stagger-delay", `${index * 80}ms`);
});

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

    article.style.setProperty("--stagger-delay", `${(index % 6) * 70}ms`);
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
      syncLightboxCursorState();
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

lightbox?.addEventListener("close", () => {
  syncLightboxCursorState();
  setCustomCursorActive(false);
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
  const setHologramStatus = (message, state = "info") => {
    if (!hologramStatus) return;
    hologramStatus.textContent = message;
    hologramStatus.classList.toggle("is-hidden", state === "hidden");
    hologramStatus.classList.toggle("is-error", state === "error");
  };

  if (window.location.protocol === "file:") {
    updateLoaderText("3D preview needs a local server to load reliably.");
    setHologramStatus(
      "3D preview may be blocked when this page is opened with file://. Use a local server for reliable loading.",
      "error"
    );
  } else {
    updateLoaderText("Preparing 3D character preview...");
    setHologramStatus("Loading 3D preview...");
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(hologramStage.clientWidth, hologramStage.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  hologramStage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    26,
    hologramStage.clientWidth / hologramStage.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.8, 8.4);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 4.4;
  controls.maxDistance = 11;
  controls.minPolarAngle = Math.PI * 0.22;
  controls.maxPolarAngle = Math.PI * 0.68;
  controls.autoRotate = !prefersReducedMotion.matches;
  controls.autoRotateSpeed = 0.65;
  controls.target.set(0, 1.25, 0);
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

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.7);
  const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.6);
  keyLight.position.set(3.5, 7, 5.5);
  const fillLight = new THREE.DirectionalLight(0xffffff, 1.15);
  fillLight.position.set(-3.8, 4.5, 3.2);
  const rimLight = new THREE.DirectionalLight(0xf3efe6, 0.9);
  rimLight.position.set(-2.6, 3.4, -4.8);
  scene.add(ambientLight, keyLight, fillLight, rimLight);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.7, 0.3, 48, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xb9b1a4,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    })
  );
  pedestal.position.y = -2.9;
  scene.add(pedestal);

  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);
  let currentVrm = null;

  loader.load(
    "resources/3D/VRM/Eku_VRM_v1_0_0.vrm",
    (gltf) => {
      const vrm = gltf.userData.vrm;
      if (!vrm) {
        setHologramStatus("VRM file loaded, but no VRM scene was found.", "error");
        return;
      }

      currentVrm = vrm;
      VRMUtils.rotateVRM0(vrm);

      const vrmScene = vrm.scene;
      const box = new THREE.Box3().setFromObject(vrmScene);
      const size = box.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = 6.6 / maxAxis;

      vrmScene.scale.setScalar(scale);
      vrmScene.position.set(0, 0, 0);

      vrmScene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
              if ("transparent" in material) material.transparent = true;
              if ("depthWrite" in material) material.depthWrite = true;
              if ("needsUpdate" in material) material.needsUpdate = true;
            });
          }
        }
      });

      const alignedBox = new THREE.Box3().setFromObject(vrmScene);
      const alignedCenter = alignedBox.getCenter(new THREE.Vector3());
      const alignedSize = alignedBox.getSize(new THREE.Vector3());

      vrmScene.position.x -= alignedCenter.x;
      vrmScene.position.z -= alignedCenter.z;
      vrmScene.position.y -= alignedBox.min.y + 2.85;

      modelGroup.add(vrmScene);

      const fitHeight = Math.max(alignedSize.y * 0.5, 1.65);
      const fitDistance = Math.max(alignedSize.y * 0.78, alignedSize.x * 0.92, 3.9);
      camera.position.set(0, fitHeight, fitDistance);
      controls.minDistance = Math.max(fitDistance * 0.8, 2.3);
      controls.maxDistance = Math.max(fitDistance * 1.32, controls.minDistance + 1);
      controls.target.set(0, Math.max(alignedSize.y * 0.52, 1.2), 0);
      controls.update();
      setHologramStatus("3D preview ready.", "hidden");
      updateLoaderText("Opening board...");
      modelSettled = true;
      hidePageLoader();
    },
    undefined,
    (error) => {
      console.error("VRM load failed.", error);
      setHologramStatus(
        "3D preview could not load. Try opening the site from a local web server instead of file://.",
        "error"
      );
      updateLoaderText("3D preview could not load, opening the board anyway...");
      modelSettled = true;
      hidePageLoader();
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
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;
    modelGroup.position.y = Math.sin(elapsed * 1.1) * 0.05;
    pedestal.rotation.y = elapsed * 0.06;
    currentVrm?.update(delta);
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}
