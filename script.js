const API_BASE_URL =
  "https://tracklist-api.shaaranhan-sivananthan.workers.dev";

// ============================================================
// STATE
// ============================================================

let selectedArtist = null;
let selectedAlbum = null;
let selectedVersion = null;

let tracks = [];
let correctOrder = [];

let artistSearchTimer = null;

const artistCache = new Map();
const albumCache = new Map();
const versionCache = new Map();
const trackCache = new Map();


// ============================================================
// ELEMENTS
// ============================================================

const artistSearchInput =
  document.getElementById("artist-search");

const artistSearchButton =
  document.getElementById("artist-search-button");

const artistStatus =
  document.getElementById("artist-status");

const artistList =
  document.getElementById("artist-list");

const selectedArtistElement =
  document.getElementById("selected-artist");

const albumStatus =
  document.getElementById("album-status");

const albumList =
  document.getElementById("album-list");

const selectedAlbumElement =
  document.getElementById("selected-album");

const versionArtistElement =
  document.getElementById("version-artist");

const versionStatus =
  document.getElementById("version-status");

const versionList =
  document.getElementById("version-list");

const gameAlbumElement =
  document.getElementById("game-album");

const gameArtistElement =
  document.getElementById("game-artist");

const gameVersionElement =
  document.getElementById("game-version");

const gameStatus =
  document.getElementById("game-status");

const trackList =
  document.getElementById("track-list");

const submitButton =
  document.getElementById("submit-button");

const playAgainButton =
  document.getElementById("play-again-button");

const chooseAlbumButton =
  document.getElementById("choose-album-button");

const chooseArtistButton =
  document.getElementById("choose-artist-button");

const backToArtistsButton =
  document.getElementById("back-to-artists");

const backToAlbumsButton =
  document.getElementById("back-to-albums");


// ============================================================
// SCREEN HELPERS
// ============================================================

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const screen = document.getElementById(id);

  if (screen) {
    screen.classList.add("active");
  }
}


// ============================================================
// API
// ============================================================

async function apiGet(path) {
  const response = await fetch(
    `${API_BASE_URL}${path}`
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error ||
      "Something went wrong while loading data.";

    throw new Error(message);
  }

  return data;
}


// ============================================================
// ARTIST SEARCH
// ============================================================

function searchArtists() {
  const query =
    artistSearchInput.value.trim();

  clearTimeout(artistSearchTimer);

  if (query.length < 2) {
    artistList.innerHTML = "";
    artistStatus.textContent =
      "Type at least 2 characters.";
    return;
  }

  artistStatus.textContent = "Searching…";
  artistList.innerHTML = "";

  artistSearchTimer = setTimeout(
    async () => {
      try {
        const cacheKey =
          query.toLowerCase();

        let artists =
          artistCache.get(cacheKey);

        if (!artists) {
          artists = await apiGet(
            `/search-artists?query=${encodeURIComponent(
              query
            )}`
          );

          artistCache.set(cacheKey, artists);
        }

        if (!artists.length) {
          artistStatus.textContent =
            "No artists found.";
          return;
        }

        artistStatus.textContent =
          "Choose an artist:";

        renderArtists(artists);
      } catch (error) {
        console.error(error);

        artistStatus.textContent =
          "Could not load artists. Please try again.";
      }
    },
    350
  );
}

function renderArtists(artists) {
  artistList.innerHTML = "";

  artists.forEach((artist) => {
    const button =
      document.createElement("button");

    button.className =
      "selection-button";

    const name =
      document.createElement("strong");

    name.textContent =
      artist.name;

    button.appendChild(name);

    if (artist.disambiguation) {
      const details =
        document.createElement("span");

      details.textContent =
        artist.disambiguation;

      button.appendChild(details);
    }

    button.addEventListener(
      "click",
      () => selectArtist(artist)
    );

    artistList.appendChild(button);
  });
}


// ============================================================
// ARTIST
// ============================================================

async function selectArtist(artist) {
  selectedArtist = artist;

  selectedArtistElement.textContent =
    artist.name;

  albumList.innerHTML = "";

  albumStatus.textContent =
    "Loading albums…";

  showScreen("album-screen");

  try {
    let albums =
      albumCache.get(artist.id);

    if (!albums) {
      albums = await apiGet(
        `/artist/${encodeURIComponent(
          artist.id
        )}/albums`
      );

      albumCache.set(
        artist.id,
        albums
      );
    }

    if (!albums.length) {
      albumStatus.textContent =
        "No official albums found.";
      return;
    }

    albumStatus.textContent =
      "Choose an album:";

    renderAlbums(albums);
  } catch (error) {
    console.error(error);

    albumStatus.textContent =
      "Could not load albums. Please try again.";
  }
}

function renderAlbums(albums) {
  albumList.innerHTML = "";

  albums.forEach((album) => {
    const button =
      document.createElement("button");

    button.className =
      "selection-button album-button";

    const title =
      document.createElement("strong");

    title.textContent =
      album.title;

    button.appendChild(title);

    if (album.firstReleaseDate) {
      const date =
        document.createElement("span");

      date.textContent =
        album.firstReleaseDate.slice(0, 4);

      button.appendChild(date);
    }

    button.addEventListener(
      "click",
      () => selectAlbum(album)
    );

    albumList.appendChild(button);
  });
}


// ============================================================
// ALBUM
// ============================================================

async function selectAlbum(album) {
  selectedAlbum = album;

  selectedAlbumElement.textContent =
    album.title;

  versionArtistElement.textContent =
    selectedArtist?.name || "";

  versionList.innerHTML = "";

  versionStatus.textContent =
    "Loading tracklist…";

  showScreen("version-screen");

  try {
    let versions =
      versionCache.get(album.id);

    if (!versions) {
      versions = await apiGet(
        `/release-group/${encodeURIComponent(
          album.id
        )}/releases`
      );

      versionCache.set(
        album.id,
        versions
      );
    }

    if (!versions.length) {
      versionStatus.textContent =
        "No usable version of this album was found.";
      return;
    }

    versionStatus.textContent =
      "Choose a version:";

    renderVersions(versions);
  } catch (error) {
    console.error(error);

    versionStatus.textContent =
      "Could not load this album. Please try again.";
  }
}

function renderVersions(versions) {
  versionList.innerHTML = "";

  versions.forEach((version) => {
    const button =
      document.createElement("button");

    button.className =
      "selection-button";

    const title =
      document.createElement("strong");

    title.textContent =
      version.tracklistType ||
      "Standard";

    button.appendChild(title);

    const details =
      document.createElement("span");

    const trackText =
      version.trackCount === 1
        ? "1 track"
        : `${version.trackCount} tracks`;

    details.textContent =
      `${trackText}${
        version.date
          ? ` • ${version.date.slice(0, 4)}`
          : ""
      }`;

    button.appendChild(details);

    button.addEventListener(
      "click",
      () => selectVersion(version)
    );

    versionList.appendChild(button);
  });
}


// ============================================================
// VERSION / TRACKS
// ============================================================

async function selectVersion(version) {
  selectedVersion = version;

  gameAlbumElement.textContent =
    selectedAlbum?.title || "";

  gameArtistElement.textContent =
    selectedArtist?.name || "";

  gameVersionElement.textContent =
    version.tracklistType || "Standard";

  gameStatus.textContent =
    "Loading tracks…";

  trackList.innerHTML = "";

  showScreen("game-screen");

  try {
    let loadedTracks =
      trackCache.get(version.id);

    if (!loadedTracks) {
      loadedTracks = await apiGet(
        `/release/${encodeURIComponent(
          version.id
        )}/tracks`
      );

      trackCache.set(
        version.id,
        loadedTracks
      );
    }

    if (!loadedTracks.length) {
      gameStatus.textContent =
        "This version has no usable tracklist.";

      return;
    }

    startGame(loadedTracks);
  } catch (error) {
    console.error(error);

    gameStatus.textContent =
      "Could not load the tracklist. Please try again.";
  }
}


// ============================================================
// GAME
// ============================================================

function startGame(loadedTracks) {
  correctOrder =
    loadedTracks.map(
      (track) => track.title
    );

  tracks =
    shuffle([...correctOrder]);

  gameStatus.textContent =
    `${tracks.length} tracks — put them in the correct order.`;

  submitButton.disabled = false;

  playAgainButton.style.display =
    "none";

  renderTracks();
}

function shuffle(array) {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];
  }

  return result;
}


// ============================================================
// DRAGGING
// ============================================================

function renderTracks() {
  trackList.innerHTML = "";

  tracks.forEach((trackTitle, index) => {
    const item =
      document.createElement("div");

    item.className =
      "track-item";

    item.dataset.index =
      String(index);

    const number =
      document.createElement("span");

    number.className =
      "track-number";

    number.textContent =
      String(index + 1);

    const title =
      document.createElement("span");

    title.className =
      "track-title";

    title.textContent =
      trackTitle;

    const handle =
      document.createElement("span");

    handle.className =
      "drag-handle";

    handle.textContent =
      "☷";

    handle.setAttribute(
      "aria-label",
      "Drag track"
    );

    item.appendChild(number);
    item.appendChild(title);
    item.appendChild(handle);

    setupDrag(item, handle);

    trackList.appendChild(item);
  });
}

function setupDrag(item, handle) {
  let dragging = false;
  let pointerId = null;

  handle.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();

      dragging = true;
      pointerId =
        event.pointerId;

      handle.setPointerCapture(
        pointerId
      );

      item.classList.add(
        "dragging"
      );
    }
  );

  handle.addEventListener(
    "pointermove",
    (event) => {
      if (!dragging) return;

      const target =
        document.elementFromPoint(
          event.clientX,
          event.clientY
        );

      const targetItem =
        target?.closest(
          ".track-item"
        );

      if (
        !targetItem ||
        targetItem === item ||
        !trackList.contains(
          targetItem
        )
      ) {
        return;
      }

      const rect =
        targetItem.getBoundingClientRect();

      const middle =
        rect.top +
        rect.height / 2;

      if (
        event.clientY < middle
      ) {
        trackList.insertBefore(
          item,
          targetItem
        );
      } else {
        trackList.insertBefore(
          item,
          targetItem.nextSibling
        );
      }

      updateTrackArrayFromDOM();
    }
  );

  handle.addEventListener(
    "pointerup",
    finishDrag
  );

  handle.addEventListener(
    "pointercancel",
    finishDrag
  );

  function finishDrag(event) {
    if (!dragging) return;

    dragging = false;

    item.classList.remove(
      "dragging"
    );

    if (
      pointerId !== null &&
      handle.hasPointerCapture(pointerId)
    ) {
      handle.releasePointerCapture(
        pointerId
      );
    }

    pointerId = null;

    updateTrackArrayFromDOM();
  }
}

function updateTrackArrayFromDOM() {
  tracks = [
    ...trackList.querySelectorAll(
      ".track-item"
    ),
  ].map(
    (item) =>
      item.querySelector(
        ".track-title"
      ).textContent
  );

  updateTrackNumbers();
}

function updateTrackNumbers() {
  [
    ...trackList.querySelectorAll(
      ".track-item"
    ),
  ].forEach((item, index) => {
    const number =
      item.querySelector(
        ".track-number"
      );

    if (number) {
      number.textContent =
        String(index + 1);
    }
  });
}


// ============================================================
// SCORING
// ============================================================

function submitGame() {
  let score = 0;

  const items =
    trackList.querySelectorAll(
      ".track-item"
    );

  items.forEach((item, index) => {
    const title =
      item.querySelector(
        ".track-title"
      ).textContent;

    const result =
      document.createElement("span");

    result.className =
      "track-result";

    if (
      correctOrder[index] === title
    ) {
      score++;

      result.textContent =
        "✓";

      result.classList.add(
        "correct"
      );
    } else {
      const correctPosition =
        correctOrder.indexOf(title) + 1;

      result.textContent =
        `✗ #${correctPosition}`;

      result.classList.add(
        "incorrect"
      );
    }

    item.appendChild(result);
  });

  gameStatus.textContent =
    `Score: ${score} / ${correctOrder.length}`;

  submitButton.disabled = true;

  playAgainButton.style.display =
    "block";
}


// ============================================================
// NAVIGATION
// ============================================================

function goToArtists() {
  selectedArtist = null;
  selectedAlbum = null;
  selectedVersion = null;

  showScreen("artist-screen");

  artistStatus.textContent =
    "Search for an artist.";

  artistList.innerHTML = "";
}

function goToAlbums() {
  selectedAlbum = null;
  selectedVersion = null;

  showScreen("album-screen");

  albumStatus.textContent =
    "Choose an album.";

  if (selectedArtist) {
    selectedArtistElement.textContent =
      selectedArtist.name;
  }
}

function playAgain() {
  if (!correctOrder.length) {
    return;
  }

  tracks =
    shuffle([...correctOrder]);

  gameStatus.textContent =
    `${tracks.length} tracks — put them in the correct order.`;

  submitButton.disabled = false;

  playAgainButton.style.display =
    "none";

  renderTracks();
}


// ============================================================
// EVENT LISTENERS
// ============================================================

artistSearchButton.addEventListener(
  "click",
  searchArtists
);

artistSearchInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      searchArtists();
    }
  }
);

backToArtistsButton.addEventListener(
  "click",
  goToArtists
);

backToAlbumsButton.addEventListener(
  "click",
  goToAlbums
);

submitButton.addEventListener(
  "click",
  submitGame
);

playAgainButton.addEventListener(
  "click",
  playAgain
);

chooseAlbumButton.addEventListener(
  "click",
  goToAlbums
);

chooseArtistButton.addEventListener(
  "click",
  goToArtists
);
