const API_BASE_URL =
  "https://tracklist-api.shaaranhan-sivananthan.workers.dev";


/* =========================================================
   STATE
========================================================= */

let selectedArtist = null;
let selectedAlbum = null;
let selectedVersion = null;

let correctOrder = [];
let tracks = [];

let draggedTrack = null;
let dragging = false;
let hasSubmitted = false;


/* =========================================================
   DOM
========================================================= */

const artistScreen = document.getElementById("artist-screen");
const albumScreen = document.getElementById("album-screen");
const versionScreen = document.getElementById("version-screen");
const gameScreen = document.getElementById("game-screen");

const artistSearch = document.getElementById("artist-search");
const artistSearchButton = document.getElementById("artist-search-button");
const artistStatus = document.getElementById("artist-status");
const artistList = document.getElementById("artist-list");

const selectedArtistElement =
  document.getElementById("selected-artist");

const albumStatus =
  document.getElementById("album-status");

const albumList =
  document.getElementById("album-list");

const versionStatus =
  document.getElementById("version-status");

const versionList =
  document.getElementById("version-list");

const selectedAlbumElement =
  document.getElementById("selected-album");

const versionArtistElement =
  document.getElementById("version-artist");

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

const scoreElement =
  document.getElementById("score");

const playAgainButton =
  document.getElementById("play-again-button");

const chooseAlbumButton =
  document.getElementById("choose-album-button");

const chooseArtistButton =
  document.getElementById("choose-artist-button");

const backToArtistsButton =
  document.getElementById("back-to-artists-button");

const backToAlbumsButton =
  document.getElementById("back-to-albums-button");


/* =========================================================
   INITIAL SCREEN
========================================================= */

showScreen(artistScreen);

albumScreen.style.display = "none";
versionScreen.style.display = "none";
gameScreen.style.display = "none";

scoreElement.textContent = "";

playAgainButton.style.display = "none";
chooseAlbumButton.style.display = "none";
chooseArtistButton.style.display = "none";


/* =========================================================
   HELPERS
========================================================= */

function showScreen(screen) {
  artistScreen.style.display = "none";
  albumScreen.style.display = "none";
  versionScreen.style.display = "none";
  gameScreen.style.display = "none";

  screen.style.display = "block";
}


function setStatus(element, message) {
  element.textContent = message || "";
}


function clearElement(element) {
  element.innerHTML = "";
}


function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatYear(date) {
  if (!date) {
    return "";
  }

  return String(date).slice(0, 4);
}


function formatDate(date) {
  if (!date) {
    return "";
  }

  const parts = String(date).split("-");

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[1]}/${parts[0]}`;
  }

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}


function formatCountry(country) {
  if (!country) {
    return "";
  }

  return country === "XW" ? "Worldwide" : country;
}


function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}


async function apiRequest(path) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data && data.error
        ? data.error
        : "Something went wrong."
    );
  }

  return data;
}


/* =========================================================
   ARTIST SEARCH
========================================================= */

artistSearchButton.addEventListener(
  "click",
  searchArtists
);


artistSearch.addEventListener(
  "keydown",
  event => {
    if (event.key === "Enter") {
      searchArtists();
    }
  }
);


async function searchArtists() {
  const query = artistSearch.value.trim();

  if (!query) {
    setStatus(
      artistStatus,
      "Enter an artist name."
    );

    return;
  }

  artistSearchButton.disabled = true;

  clearElement(artistList);

  setStatus(
    artistStatus,
    "Searching..."
  );

  try {
    const data = await apiRequest(
      `/search-artists?query=${encodeURIComponent(query)}`
    );

    const artists = Array.isArray(data.artists)
      ? data.artists
      : [];

    if (!artists.length) {
      setStatus(
        artistStatus,
        "No artists found."
      );

      return;
    }

    setStatus(
      artistStatus,
      ""
    );

    renderArtists(artists);

  } catch (error) {
    console.error(error);

    setStatus(
      artistStatus,
      error.message || "Search failed."
    );

  } finally {
    artistSearchButton.disabled = false;
  }
}


function renderArtists(artists) {
  clearElement(artistList);

  artists.forEach(artist => {

    const button = document.createElement("button");

    button.className = "selection-button";

    const title = document.createElement("span");

    title.className = "selection-title";

    title.textContent = artist.name || "Unknown artist";


    const details = [];

    if (artist.disambiguation) {
      details.push(artist.disambiguation);
    }

    if (artist.country) {
      details.push(artist.country);
    }

    if (details.length) {
      const subtitle = document.createElement("span");

      subtitle.className = "selection-subtitle";

      subtitle.textContent = details.join(" • ");

      button.appendChild(title);

      button.appendChild(subtitle);

    } else {
      button.appendChild(title);
    }


    button.addEventListener(
      "click",
      () => selectArtist(artist)
    );

    artistList.appendChild(button);
  });
}


/* =========================================================
   ARTIST → ALBUMS
========================================================= */

async function selectArtist(artist) {
  selectedArtist = artist;

  selectedAlbum = null;
  selectedVersion = null;

  selectedArtistElement.textContent =
    artist.name || "";

  clearElement(albumList);

  setStatus(
    albumStatus,
    "Loading albums..."
  );

  showScreen(albumScreen);

  try {
    const data = await apiRequest(
      `/artist/${encodeURIComponent(artist.id)}/albums`
    );

    const albums = Array.isArray(data.albums)
      ? data.albums
      : [];

    if (!albums.length) {
      setStatus(
        albumStatus,
        "No albums found for this artist."
      );

      return;
    }

    setStatus(
      albumStatus,
      ""
    );

    renderAlbums(albums);

  } catch (error) {
    console.error(error);

    setStatus(
      albumStatus,
      error.message || "Could not load albums."
    );
  }
}


function renderAlbums(albums) {
  clearElement(albumList);

  albums.forEach(album => {

    const button = document.createElement("button");

    button.className = "selection-button";


    const title = document.createElement("span");

    title.className = "selection-title";

    title.textContent =
      album.title || "Unknown album";


    if (album.firstReleaseDate) {

      const year = document.createElement("span");

      year.className = "selection-year";

      year.textContent =
        formatYear(album.firstReleaseDate);

      title.appendChild(year);
    }


    const details = [];

    if (album.secondaryTypes &&
        album.secondaryTypes.length) {

      details.push(
        album.secondaryTypes.join(", ")
      );
    }

    if (album.disambiguation) {
      details.push(
        album.disambiguation
      );
    }


    button.appendChild(title);


    if (details.length) {

      const subtitle = document.createElement("span");

      subtitle.className = "selection-subtitle";

      subtitle.textContent =
        details.join(" • ");

      button.appendChild(subtitle);
    }


    button.addEventListener(
      "click",
      () => selectAlbum(album)
    );

    albumList.appendChild(button);
  });
}


/* =========================================================
   ALBUM → VERSIONS
========================================================= */

async function selectAlbum(album) {
  selectedAlbum = album;
  selectedVersion = null;

  selectedAlbumElement.textContent =
    album.title || "";

  versionArtistElement.textContent =
    selectedArtist
      ? selectedArtist.name || ""
      : "";

  clearElement(versionList);

  setStatus(
    versionStatus,
    "Loading versions..."
  );

  showScreen(versionScreen);

  try {
    const data = await apiRequest(
      `/release-group/${encodeURIComponent(album.id)}/releases`
    );

    const versions = Array.isArray(data.versions)
      ? data.versions
      : [];

    if (!versions.length) {
      setStatus(
        versionStatus,
        "No usable version of this album was found."
      );

      return;
    }

    setStatus(
      versionStatus,
      ""
    );

    renderVersions(versions);

  } catch (error) {
    console.error(error);

    setStatus(
      versionStatus,
      error.message ||
      "Could not load album versions."
    );
  }
}


function renderVersions(versions) {
  clearElement(versionList);

  versions.forEach(version => {

    const button = document.createElement("button");

    button.className = "selection-button";


    const title = document.createElement("span");

    title.className = "selection-title";

    title.textContent =
      version.title || selectedAlbum.title;


    const details = [];


    if (version.date) {
      details.push(
        formatDate(version.date)
      );
    }


    if (version.country) {
      details.push(
        formatCountry(version.country)
      );
    }


    if (version.formats &&
        version.formats.length) {

      details.push(
        version.formats.join(", ")
      );
    }


    if (version.trackCount) {
      details.push(
        `${version.trackCount} tracks`
      );
    }


    if (version.disambiguation) {
      details.push(
        version.disambiguation
      );
    }


    button.appendChild(title);


    if (details.length) {

      const subtitle = document.createElement("span");

      subtitle.className = "selection-subtitle";

      subtitle.textContent =
        details.join(" • ");

      button.appendChild(subtitle);
    }


    button.addEventListener(
      "click",
      () => selectVersion(version)
    );

    versionList.appendChild(button);
  });
}


/* =========================================================
   VERSION → GAME
========================================================= */

async function selectVersion(version) {
  selectedVersion = version;

  clearElement(trackList);

  scoreElement.textContent = "";

  gameStatus.textContent = "";

  submitButton.disabled = true;

  playAgainButton.style.display = "none";

  chooseAlbumButton.style.display = "none";

  chooseArtistButton.style.display = "none";

  gameAlbumElement.textContent =
    selectedAlbum
      ? selectedAlbum.title || ""
      : "";

  gameArtistElement.textContent =
    selectedArtist
      ? selectedArtist.name || ""
      : "";

  gameVersionElement.textContent =
    buildVersionLabel(version);

  setStatus(
    gameStatus,
    "Loading tracks..."
  );

  showScreen(gameScreen);

  try {
    const data = await apiRequest(
      `/release/${encodeURIComponent(version.id)}/tracks`
    );

    const loadedTracks = Array.isArray(data.tracks)
      ? data.tracks
      : [];

    if (loadedTracks.length < 2) {
      setStatus(
        gameStatus,
        "This version does not have enough tracks to play."
      );

      return;
    }

    correctOrder = loadedTracks.map(
      track => track.title
    );

    tracks = shuffle(loadedTracks);

    renderTracks();

    setStatus(
      gameStatus,
      ""
    );

    submitButton.disabled = false;

  } catch (error) {
    console.error(error);

    setStatus(
      gameStatus,
      error.message ||
      "Could not load the tracklist."
    );
  }
}


function buildVersionLabel(version) {
  const parts = [];

  if (version.title &&
      selectedAlbum &&
      version.title !== selectedAlbum.title) {

    parts.push(version.title);
  }

  if (version.date) {
    parts.push(formatDate(version.date));
  }

  if (version.country) {
    parts.push(formatCountry(version.country));
  }

  if (version.formats &&
      version.formats.length) {

    parts.push(version.formats.join(", "));
  }

  return parts.join(" • ");
}


/* =========================================================
   TRACK RENDERING
========================================================= */

function renderTracks() {
  clearElement(trackList);

  tracks.forEach(
    (track, index) => {

      const trackElement =
        document.createElement("div");

      trackElement.className = "track";

      trackElement.dataset.index = index;


      const number =
        document.createElement("div");

      number.className = "track-number";

      number.textContent =
        `${index + 1}.`;


      const name =
        document.createElement("div");

      name.className = "track-name";

      name.textContent =
        track.title || "Unknown track";


      const handle =
        document.createElement("div");

      handle.className = "drag-handle";

      handle.textContent = "☰";

      handle.setAttribute(
        "aria-label",
        "Drag track"
      );


      trackElement.appendChild(number);

      trackElement.appendChild(name);

      trackElement.appendChild(handle);


      setupDragHandle(
        trackElement,
        handle
      );


      trackList.appendChild(trackElement);
    }
  );
}


/* =========================================================
   POINTER DRAGGING
   Works with mouse + iPhone/iPad touch.
========================================================= */

function setupDragHandle(
  trackElement,
  handle
) {

  handle.addEventListener(
    "pointerdown",
    event => {

      if (hasSubmitted) {
        return;
      }

      event.preventDefault();

      draggedTrack = trackElement;

      dragging = true;

      trackElement.classList.add(
        "dragging"
      );

      try {
        handle.setPointerCapture(
          event.pointerId
        );
      } catch {
        // Ignore unsupported pointer capture.
      }
    }
  );


  handle.addEventListener(
    "pointermove",
    event => {

      if (!dragging ||
          !draggedTrack) {

        return;
      }

      event.preventDefault();

      const elements =
        [...trackList.querySelectorAll(".track:not(.dragging)")];

      let closest = null;

      let closestDistance =
        Number.POSITIVE_INFINITY;


      elements.forEach(element => {

        const rect =
          element.getBoundingClientRect();

        const center =
          rect.top + rect.height / 2;

        const distance =
          Math.abs(event.clientY - center);

        if (distance < closestDistance) {
          closestDistance = distance;

          closest = element;
        }
      });


      if (!closest) {
        return;
      }


      const rect =
        closest.getBoundingClientRect();

      if (event.clientY < rect.top + rect.height / 2) {

        trackList.insertBefore(
          draggedTrack,
          closest
        );

      } else {

        trackList.insertBefore(
          draggedTrack,
          closest.nextSibling
        );
      }
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
}


function finishDrag(event) {

  if (!dragging) {
    return;
  }

  dragging = false;

  if (draggedTrack) {

    draggedTrack.classList.remove(
      "dragging"
    );
  }

  draggedTrack = null;
}


/* =========================================================
   SUBMIT / SCORING
========================================================= */

submitButton.addEventListener(
  "click",
  submitGame
);


function submitGame() {

  if (hasSubmitted) {
    return;
  }

  const elements =
    [...trackList.querySelectorAll(".track")];

  if (!elements.length) {
    return;
  }

  hasSubmitted = true;

  submitButton.disabled = true;


  let score = 0;


  elements.forEach(
    (element, index) => {

      const title =
        element.querySelector(".track-name")
          .textContent;

      const correctTitle =
        correctOrder[index];


      if (title === correctTitle) {

        score++;

        element.classList.add(
          "track-correct"
        );

      } else {

        element.classList.add(
          "track-incorrect"
        );
      }
    }
  );


  scoreElement.textContent =
    `Score: ${score} / ${correctOrder.length}`;


  gameStatus.innerHTML =
    `<div class="result ${
      score === correctOrder.length
        ? "correct"
        : "incorrect"
    }">${
      score === correctOrder.length
        ? "Perfect!"
        : "Check the correct positions below."
    }</div>`;


  elements.forEach(
    (element, index) => {

      if (
        element.classList.contains(
          "track-incorrect"
        )
      ) {

        const correctPosition =
          correctOrder.indexOf(
            element.querySelector(".track-name")
              .textContent
          ) + 1;


        const result =
          document.createElement("div");

        result.className =
          "result incorrect";

        result.textContent =
          `Correct position: #${correctPosition}`;


        element.appendChild(result);
      }
    }
  );


  playAgainButton.style.display =
    "block";

  chooseAlbumButton.style.display =
    "block";

  chooseArtistButton.style.display =
    "block";
}


/* =========================================================
   PLAY AGAIN
========================================================= */

playAgainButton.addEventListener(
  "click",
  () => {

    hasSubmitted = false;

    scoreElement.textContent = "";

    gameStatus.textContent = "";

    submitButton.disabled = false;

    playAgainButton.style.display =
      "none";

    chooseAlbumButton.style.display =
      "none";

    chooseArtistButton.style.display =
      "none";


    tracks = shuffle(
      correctOrder.map(
        title => ({ title })
      )
    );


    renderTracks();
  }
);


/* =========================================================
   NAVIGATION
========================================================= */

chooseAlbumButton.addEventListener(
  "click",
  () => {

    if (!selectedArtist) {
      return;
    }

    selectArtist(selectedArtist);
  }
);


chooseArtistButton.addEventListener(
  "click",
  () => {

    selectedArtist = null;

    selectedAlbum = null;

    selectedVersion = null;

    artistSearch.value = "";

    clearElement(artistList);

    setStatus(
      artistStatus,
      ""
    );

    showScreen(artistScreen);

    artistSearch.focus();
  }
);


backToArtistsButton.addEventListener(
  "click",
  () => {

    selectedArtist = null;

    selectedAlbum = null;

    selectedVersion = null;

    clearElement(albumList);

    setStatus(
      albumStatus,
      ""
    );

    showScreen(artistScreen);
  }
);


backToAlbumsButton.addEventListener(
  "click",
  () => {

    if (!selectedArtist) {
      showScreen(artistScreen);

      return;
    }

    selectArtist(selectedArtist);
  }
);
