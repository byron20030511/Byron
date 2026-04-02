import * as THREE from "./vendor/three/three.module.js";
import { GLTFLoader } from "./vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "./vendor/three-vrm.module.js";
import {
  VRMAnimationLoaderPlugin,
  createVRMAnimationClip,
} from "./vendor/three-vrm-animation.module.js";

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
const audioVisualizer = document.querySelector("#audioVisualizer");
const floatingControls = document.querySelector(".floating-controls");
const floatingTopButton = document.querySelector("#floatingTopButton");
const floatingAudioToggle = document.querySelector("#floatingAudioToggle");
const floatingAudioText = document.querySelector(".floating-audio-text");
const heroMedia = document.querySelector("#heroMedia");
const sceneBackground = document.querySelector("#sceneBackground");
const sceneStatus = document.querySelector("#sceneStatus");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
let pageReady = false;
let modelSettled = !sceneBackground;
let audioContext;
let audioAnalyser;
let audioSourceNode;
let audioDataArray;
let visualizerFrame = 0;
let audioFadeFrame = 0;
let pendingInteractionPlayback = false;
const AUDIO_TARGET_VOLUME = 0.72;
const AUDIO_FADE_IN_MS = 900;
const AUDIO_FADE_OUT_MS = 520;

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

const resizeAudioVisualizer = () => {
  if (!audioVisualizer) return;
  const rect = audioVisualizer.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  audioVisualizer.width = Math.max(1, Math.round(rect.width * pixelRatio));
  audioVisualizer.height = Math.max(1, Math.round(rect.height * pixelRatio));
};

const drawIdleVisualizer = () => {
  if (!audioVisualizer) return;
  const context = audioVisualizer.getContext("2d");
  if (!context) return;
  const width = audioVisualizer.width;
  const height = audioVisualizer.height;

  context.clearRect(0, 0, width, height);
  context.lineWidth = Math.max(1.2, width * 0.0012);
  context.strokeStyle = "rgba(31, 30, 51, 0.22)";
  context.beginPath();

  const points = 40;
  for (let index = 0; index <= points; index += 1) {
    const x = (width / points) * index;
    const wave = Math.sin(index * 0.75) * height * 0.02;
    const y = height * 0.5 + wave;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();
};

const startAudioVisualizer = () => {
  if (!audioVisualizer || !audioAnalyser || visualizerFrame || prefersReducedMotion.matches) return;
  const context = audioVisualizer.getContext("2d");
  if (!context) return;

  const render = () => {
    visualizerFrame = window.requestAnimationFrame(render);

    if (!pageAudio || pageAudio.paused) {
      window.cancelAnimationFrame(visualizerFrame);
      visualizerFrame = 0;
      drawIdleVisualizer();
      return;
    }

    audioAnalyser.getByteTimeDomainData(audioDataArray);

    const width = audioVisualizer.width;
    const height = audioVisualizer.height;
    context.clearRect(0, 0, width, height);

    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(31, 30, 51, 0.15)");
    gradient.addColorStop(0.28, "rgba(113, 104, 179, 0.38)");
    gradient.addColorStop(0.5, "rgba(31, 30, 51, 0.82)");
    gradient.addColorStop(0.72, "rgba(113, 104, 179, 0.38)");
    gradient.addColorStop(1, "rgba(31, 30, 51, 0.15)");

    context.lineWidth = Math.max(1.4, width * 0.0016);
    context.strokeStyle = gradient;
    context.beginPath();

    const sliceWidth = width / (audioDataArray.length - 1);
    for (let index = 0; index < audioDataArray.length; index += 1) {
      const value = audioDataArray[index] / 128;
      const x = sliceWidth * index;
      const y = (value * height) / 2;

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.stroke();

    context.strokeStyle = "rgba(31, 30, 51, 0.12)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, height * 0.5);
    context.lineTo(width, height * 0.5);
    context.stroke();
  };

  render();
};

const ensureAudioVisualizer = async () => {
  if (!pageAudio || !audioVisualizer || prefersReducedMotion.matches) return;

  resizeAudioVisualizer();

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      drawIdleVisualizer();
      return;
    }

    audioContext = new AudioContextClass();
    audioAnalyser = audioContext.createAnalyser();
    audioAnalyser.fftSize = 2048;
    audioAnalyser.smoothingTimeConstant = 0.82;
    audioDataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
  }

  if (!audioSourceNode) {
    audioSourceNode = audioContext.createMediaElementSource(pageAudio);
    audioSourceNode.connect(audioAnalyser);
    audioAnalyser.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  startAudioVisualizer();
};

const stopAudioFade = () => {
  if (audioFadeFrame) {
    window.cancelAnimationFrame(audioFadeFrame);
    audioFadeFrame = 0;
  }
};

const fadeAudioVolume = (targetVolume, duration, onComplete) => {
  if (!pageAudio) return;

  stopAudioFade();

  const startVolume = pageAudio.volume;
  const volumeDelta = targetVolume - startVolume;
  const startTime = performance.now();

  if (Math.abs(volumeDelta) < 0.001 || duration <= 0) {
    pageAudio.volume = targetVolume;
    onComplete?.();
    return;
  }

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    pageAudio.volume = startVolume + volumeDelta * eased;

    if (progress < 1) {
      audioFadeFrame = window.requestAnimationFrame(step);
    } else {
      audioFadeFrame = 0;
      pageAudio.volume = targetVolume;
      onComplete?.();
    }
  };

  audioFadeFrame = window.requestAnimationFrame(step);
};

const playAudioWithFade = async () => {
  if (!pageAudio) return;

  await ensureAudioVisualizer();
  stopAudioFade();
  pageAudio.volume = 0;
  await pageAudio.play();
  fadeAudioVolume(AUDIO_TARGET_VOLUME, AUDIO_FADE_IN_MS);
};

const pauseAudioWithFade = () => {
  if (!pageAudio || pageAudio.paused) return;

  fadeAudioVolume(0, AUDIO_FADE_OUT_MS, () => {
    pageAudio.pause();
    pageAudio.volume = AUDIO_TARGET_VOLUME;
  });
};

const handleDeferredAudioStart = async () => {
  if (!pendingInteractionPlayback || !pageAudio || !pageAudio.paused) return;

  try {
    await playAudioWithFade();
    pendingInteractionPlayback = false;
    window.removeEventListener("pointerdown", handleDeferredAudioStart);
  } catch (error) {
    console.error("Deferred audio playback failed.", error);
  }
};

const toggleAudioPlayback = async () => {
  if (!pageAudio) return;

  if (pageAudio.paused) {
    try {
      await playAudioWithFade();
      pendingInteractionPlayback = false;
    } catch (error) {
      console.error("Audio playback failed.", error);
    }
  } else {
    pendingInteractionPlayback = false;
    pauseAudioWithFade();
  }
};

audioToggle?.addEventListener("click", toggleAudioPlayback);
floatingAudioToggle?.addEventListener("click", toggleAudioPlayback);
pageAudio?.addEventListener("play", () => {
  syncAudioToggle();
  if (!prefersReducedMotion.matches) {
    ensureAudioVisualizer().catch((error) => {
      console.error("Audio visualizer setup failed.", error);
    });
  }
});
pageAudio?.addEventListener("pause", syncAudioToggle);
pageAudio?.addEventListener("ended", syncAudioToggle);
syncAudioToggle();
resizeAudioVisualizer();
drawIdleVisualizer();

window.addEventListener("resize", () => {
  resizeAudioVisualizer();
  if (!pageAudio?.paused) {
    startAudioVisualizer();
  } else {
    drawIdleVisualizer();
  }
});

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
        await playAudioWithFade();
      } catch (error) {
        console.error("Autoplay was blocked.", error);
        pendingInteractionPlayback = true;
        window.addEventListener("pointerdown", handleDeferredAudioStart, { once: true });
      } finally {
        syncAudioToggle();
        if (pageAudio.paused) {
          drawIdleVisualizer();
        }
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

if (sceneBackground) {
  const setSceneStatus = (message, state = "info") => {
    if (!sceneStatus) return;
    sceneStatus.textContent = message;
    sceneStatus.classList.toggle("is-hidden", state === "hidden");
    sceneStatus.dataset.state = state;
  };

  if (window.location.protocol === "file:") {
    updateLoaderText("3D preview needs a local server to load reliably.");
    setSceneStatus(
      "3D preview may be blocked when this page is opened with file://. Use a local server for reliable loading.",
      "error"
    );
  } else {
    updateLoaderText("Preparing floating background model...");
    setSceneStatus("Loading background model...");
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, supportsFinePointer ? 1.35 : 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  sceneBackground.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf6f5fb, 9, 22);

  const camera = new THREE.PerspectiveCamera(
    28,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(1.2, 1.4, 10.8);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
  const keyLight = new THREE.DirectionalLight(0xf2efff, 1.95);
  keyLight.position.set(4.8, 6.8, 5.8);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.68);
  fillLight.position.set(-5.4, 4.1, 3.6);
  const rimLight = new THREE.PointLight(0x7168b3, 1.12, 24);
  rimLight.position.set(0.8, 2.4, -5.6);
  scene.add(ambientLight, keyLight, fillLight, rimLight);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(2.9, 3.6, 0.38, 64, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x554f7d,
      transparent: true,
      opacity: 0.09,
      wireframe: true,
    })
  );
  pedestal.position.set(1.15, -3.2, -1.4);
  scene.add(pedestal);

  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const animationLoader = new GLTFLoader();
  animationLoader.register((parser) => new VRMAnimationLoaderPlugin(parser));
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);
  let currentVrm = null;
  let animationMixer = null;
  let activeAnimationAction = null;
  let modelBaseY = 0;
  let targetScroll = 0;
  let scrollDrift = 0;

  window.addEventListener(
    "scroll",
    () => {
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      targetScroll = Math.min(window.scrollY / maxScroll, 1);
    },
    { passive: true }
  );

  loader.load(
    "resources/3D/VRM/Eku_VRM_v1_0_0.vrm",
    (gltf) => {
      const vrm = gltf.userData.vrm;
      if (!vrm) {
        setSceneStatus("VRM file loaded, but no VRM scene was found.", "error");
        return;
      }

      currentVrm = vrm;
      VRMUtils.rotateVRM0(vrm);

      const vrmScene = vrm.scene;
      const box = new THREE.Box3().setFromObject(vrmScene);
      const size = box.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = (6.6 / maxAxis) * 0.7;

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
      modelBaseY = -alignedBox.min.y + 0;
      vrmScene.position.y += modelBaseY;
      vrmScene.position.x += 7.4;
      vrmScene.position.z -= 0.85;

      modelGroup.add(vrmScene);

      const fitHeight = Math.max(alignedSize.y * 0.56, 1.6);
      const fitDistance = Math.max(alignedSize.y * 0.95, alignedSize.x * 1.1, 6.8);
      camera.position.set(6.1, fitHeight, fitDistance);
      camera.lookAt(6.1, Math.max(alignedSize.y * 0.54, 1.65), 0);

      updateLoaderText("Loading background motion...");
      setSceneStatus("Loading motion clip...");

      animationLoader.load(
        "resources/3D/明日の私に幸あれ/vrma/明日の私に幸あれ.vrma",
        (animationGltf) => {
          const vrmAnimation = animationGltf.userData.vrmAnimations?.[0];

          if (!vrmAnimation) {
            setSceneStatus("Motion file loaded, but no VRM animation was found.", "error");
            updateLoaderText("Opening board...");
            modelSettled = true;
            hidePageLoader();
            return;
          }

          const clip = createVRMAnimationClip(vrmAnimation, vrm);
          animationMixer = new THREE.AnimationMixer(vrm.scene);

          const configureLoopAction = (action) => {
            action.reset();
            action.enabled = true;
            action.clampWhenFinished = false;
            action.zeroSlopeAtStart = true;
            action.zeroSlopeAtEnd = true;
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.setEffectiveTimeScale(1);
            action.setEffectiveWeight(1);
          };

          activeAnimationAction = animationMixer.clipAction(clip);
          configureLoopAction(activeAnimationAction);
          activeAnimationAction.play();

          setSceneStatus("Background model ready.", "hidden");
          updateLoaderText("Opening board...");
          modelSettled = true;
          hidePageLoader();
        },
        undefined,
        (animationError) => {
          console.error("VRMA load failed.", animationError);
          setSceneStatus("Motion clip could not load. Showing the model without animation.", "error");
          updateLoaderText("Opening board...");
          modelSettled = true;
          hidePageLoader();
        }
      );
    },
    undefined,
    (error) => {
      console.error("VRM load failed.", error);
      setSceneStatus(
        "3D preview could not load. Try opening the site from a local web server instead of file://.",
        "error"
      );
      updateLoaderText("3D preview could not load, opening the board anyway...");
      modelSettled = true;
      hidePageLoader();
    }
  );

  const resizeRenderer = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resizeRenderer);

  const clock = new THREE.Clock();
  const animate = () => {
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;
    scrollDrift += (targetScroll - scrollDrift) * 0.06;

    const mouseOffsetX = 0;
    const mouseOffsetY = 0;
    const scrollOffsetY = prefersReducedMotion.matches ? 0 : (scrollDrift - 0.5) * 1.15;
    const scrollRotateY = prefersReducedMotion.matches ? 0 : (scrollDrift - 0.5) * 0.28;

    modelGroup.position.x = mouseOffsetX;
    modelGroup.position.y = Math.sin(elapsed * 0.9) * 0.08 + scrollOffsetY + mouseOffsetY;
    modelGroup.rotation.y = scrollRotateY + mouseOffsetX * 0.12;
    modelGroup.rotation.x = mouseOffsetY * 0.08;

    pedestal.position.x = 7.4 + mouseOffsetX * 0.45;
    pedestal.position.y = -3.2 + scrollOffsetY * 0.24;
    pedestal.rotation.y = elapsed * 0.08 + scrollRotateY * 0.5;

    animationMixer?.update(delta);
    currentVrm?.update(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}
