(function () {
  "use strict";

  // make sure she lands on the envelope, not scrolled past it
  window.scrollTo(0, 0);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // measure the *real* viewport height into --vh — some embedded browser
  // previews (VS Code's Simple Browser included) misreport vh/svh, so this
  // is the reliable fallback the CSS uses instead
  function setRealVh() {
    document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
  }
  setRealVh();
  window.addEventListener("resize", setRealVh);
  window.addEventListener("orientationchange", setRealVh);

  // ---- populate names ----
  document.getElementById("to-name-display").textContent = TO_NAME;
  document.getElementById("reasons-to-name").textContent = TO_NAME;
  document.getElementById("reasons-from-name").textContent = FROM_NAME;
  document.getElementById("footer-from-name").textContent = FROM_NAME;

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- song card ----
  const songCard = document.getElementById("song-card");
  const songAudio = document.getElementById("song-audio");
  const songPlayBtn = document.getElementById("song-play-btn");
  const songIconPath = document.getElementById("song-icon-path");
  const songBars = document.getElementById("song-bars");
  const PLAY_ICON = "M8 5v14l11-7z";
  const PAUSE_ICON = "M7 5h4v14H7zM13 5h4v14h-4z";

  document.getElementById("song-title").textContent = SONG.title || "Song Title";
  document.getElementById("song-artist").textContent = SONG.artist || "Artist";

  if (!SONG.file) {
    songCard.classList.add("song-card--missing");
    document.getElementById("song-title").textContent = "Add your song";
    document.getElementById("song-artist").textContent = "set SONG.file in config.js";
    songPlayBtn.disabled = true;
    songPlayBtn.style.opacity = "0.5";
    songPlayBtn.style.cursor = "default";
  } else {
    songAudio.src = SONG.file;

    songAudio.addEventListener("error", () => {
      songCard.classList.add("song-card--missing");
      document.getElementById("song-title").textContent = "Couldn't find that file";
      document.getElementById("song-artist").textContent = SONG.file;
      songPlayBtn.disabled = true;
      songPlayBtn.style.opacity = "0.5";
      songPlayBtn.style.cursor = "default";
    });

    songPlayBtn.addEventListener("click", () => {
      if (songAudio.paused) {
        songAudio.play();
      } else {
        songAudio.pause();
      }
    });

    songAudio.addEventListener("play", () => {
      songIconPath.setAttribute("d", PAUSE_ICON);
      songBars.classList.add("is-playing");
      songPlayBtn.setAttribute("aria-label", "Pause our song");
    });

    songAudio.addEventListener("pause", () => {
      songIconPath.setAttribute("d", PLAY_ICON);
      songBars.classList.remove("is-playing");
      songPlayBtn.setAttribute("aria-label", "Play our song");
    });
  }

  // ---- photo gallery ----
  const gallery = document.getElementById("gallery");
  const galleryFrag = document.createDocumentFragment();

  PHOTOS.forEach((photo) => {
    const fig = document.createElement("figure");
    fig.className = "polaroid";

    const frame = document.createElement("div");
    frame.className = "polaroid__frame";

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || "";
    img.loading = "lazy";
    img.addEventListener("error", () => {
      fig.classList.add("polaroid--missing");
      img.remove();
    });

    frame.appendChild(img);
    fig.appendChild(frame);

    if (photo.caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = photo.caption;
      fig.appendChild(cap);
    }

    galleryFrag.appendChild(fig);
  });

  gallery.appendChild(galleryFrag);

  // ---- build the reasons list ----
  const list = document.getElementById("reasons-list");
  const reasonsFrag = document.createDocumentFragment();

  REASONS.forEach((text, i) => {
    const num = i + 1;

    if (num > 1 && (num - 1) % 25 === 0) {
      const m = document.createElement("div");
      m.className = "milestone";
      m.textContent = wordifyMilestone(num - 1);
      reasonsFrag.appendChild(m);
    }

    const card = document.createElement("article");
    card.className = "reason-card";
    card.innerHTML =
      '<span class="reason-card__tape"></span>' +
      '<span class="reason-card__num">' + num + '.</span> ' +
      escapeHtml(text);
    reasonsFrag.appendChild(card);
  });

  list.appendChild(reasonsFrag);

  function wordifyMilestone(n) {
    const labels = { 25: "mag-scroll ka pa", 50: "malayo pa pero malayo na", 75: "dapat binasa mo lahat ha" };
    return labels[n] || n + " reasons in...";
  }

  // ---- envelope opening sequence ----
  const envelopeScreen = document.getElementById("envelope-screen");
  const reasonsScreen = document.getElementById("reasons-screen");
  const envelope = document.getElementById("envelope");
  const sealBtn = document.getElementById("seal-btn");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let opened = false;
  sealBtn.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    sealBtn.setAttribute("aria-disabled", "true");

    if (reduceMotion) {
      showReasons();
      return;
    }

    envelope.classList.add("envelope--cracking");
    setTimeout(() => envelope.classList.add("envelope--opening"), 200);
    setTimeout(() => envelope.classList.add("envelope--letter-out"), 750);
    setTimeout(() => {
      envelopeScreen.classList.add("screen--leaving");
    }, 1500);
    setTimeout(showReasons, 2150);
  });

  function showReasons() {
    envelopeScreen.classList.add("screen--hidden");
    reasonsScreen.classList.remove("screen--hidden");
    reasonsScreen.classList.add("screen--entering");
    reasonsScreen.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ---- back button: reset everything and show the envelope again ----
  const backBtn = document.getElementById("back-btn");
  backBtn.addEventListener("click", () => {
    songAudio.pause();

    reasonsScreen.classList.add("screen--hidden");
    reasonsScreen.classList.remove("screen--entering");

    envelope.classList.remove("envelope--cracking", "envelope--opening", "envelope--letter-out");
    envelopeScreen.classList.remove("screen--leaving", "screen--hidden");
    sealBtn.removeAttribute("aria-disabled");
    opened = false;

    window.scrollTo(0, 0);
  });
})();
