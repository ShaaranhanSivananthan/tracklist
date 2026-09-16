const API_BASE_URL =
  "https://tracklist-api.shaaranhan-sivananthan.workers.dev";


/* ---------------------------------------------------------
   SCREEN ELEMENTS
--------------------------------------------------------- */

const artistScreen = document.getElementById("artist-screen");
const albumScreen = document.getElementById("album-screen");
const gameScreen = document.getElementById("game-screen");

const artistSearch = document.getElementById("artist-search");
const artistSearchButton =
  document.getElementById("artist-search-button");

const artistStatus =
  document.getElementById("artist-status");

const artistList =
  document.getElementById("artist-list");

const selectedArtist =
  document.getElementById("selected-artist");

const albumStatus =
  document.getElementById("album-status");

const albumList =
  document.getElementById("album-list");

const backToArtistsButton =
  document.getElementById("back-to-artists-button");

const gameAlbum =
  document.getElementById("game-album");

const gameArtist =
  document.getElementById("game-artist");

const gameVersion =
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


/* ---------------------------------------------------------
   GAME STATE
--------------------------------------------------------- */

let currentArtist = null;
let currentAlbum = null;

let correctOrder = [];
let tracks = [];

let draggedElement = null;


/* ---------------------------------------------------------
   SCREEN MANAGEMENT
--------------------------------------------------------- */

function showScreen(screen) {
  artistScreen.style.display = "none";
  albumScreen.style.display = "none";
  gameScreen.style.display = "none";

  screen.style.display = "block";
}


/* ---------------------------------------------------------
   INITIAL STATE
--------------------------------------------------------- */

showScreen(artistScreen);

gameVersion.textContent = "";

scoreElement.textContent = "";

artistSearch.focus();


/* ---------------------------------------------------------
   ARTIST SEARCH
--------------------------------------------------------- */

artistSearchButton.addEventListener(
  "click",
  searchForArtist
);

artistSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchForArtist();
  }
});


async function searchForArtist() {
  const query = artistSearch.value.trim();

  if (!query) {
    artistStatus.textContent =
      "Enter an artist name.";

    return;
  }

  artistSearchButton.disabled = true;

  artistStatus.textContent =
    "Searching...";

  artistList.innerHTML = "";

  try {
    const response = await fetch(
      `${API_BASE_URL}/search-artists?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Artist search failed.");
    }

    const data = await response.json();

    artistList.innerHTML = "";

    if (!data.artists || data.artists.length === 0) {
      artistStatus.textContent =
        "No artists found.";

      return;
    }

    artistStatus.textContent =
      "Choose an artist:";

    data.artists.forEach((artist) => {
      const button =
        document.createElement("button");

      button.className =
        "selection-button";

      button.textContent =
        artist.disambiguation
          ? `${artist.name} — ${artist.disambiguation}`
          : artist.name;

      button.addEventListener("click", () => {
        selectArtist(artist);
      });

      artistList.appendChild(button);
    });
  } catch (error) {
    console.error(error);

    artistStatus.textContent =
      "Something went wrong. Try again.";
  } finally {
    artistSearchButton.disabled = false;
  }
}


/* ---------------------------------------------------------
   SELECT ARTIST
--------------------------------------------------------- */

async function selectArtist(artist) {
  currentArtist = artist;

  selectedArtist.textContent =
    artist.name;

  albumStatus.textContent =
    "Loading albums...";

  albumList.innerHTML = "";

  showScreen(albumScreen);

  try {
    const response = await fetch(
      `${API_BASE_URL}/artist/${artist.id}/albums`
    );

    if (!response.ok) {
      throw new Error("Could not load albums.");
    }

    const data = await response.json();

    albumList.innerHTML = "";

    if (!data.albums || data.albums.length === 0) {
      albumStatus.textContent =
        "No standard albums found for this artist.";

      return;
    }

    albumStatus.textContent =
      "Choose an album:";

    data.albums.forEach((album) => {
      const button =
        document.createElement("button");

      button.className =
        "selection-button";

      const year =
        album.year
          ? ` (${album.year})`
          : "";

      button.textContent =
        `${album.title}${year}`;

      button.addEventListener("click", () => {
        selectAlbum(album);
      });

      albumList.appendChild(button);
    });
  } catch (error) {
    console.error(error);

    albumStatus.textContent =
      "Something went wrong loading the albums.";
  }
}


/* ---------------------------------------------------------
   SELECT ALBUM
--------------------------------------------------------- */

async function selectAlbum(album) {
  currentAlbum = album;

  gameAlbum.textContent =
    album.title;

  gameArtist.textContent =
    currentArtist.name;

  /*
   * There is intentionally no version selection anymore.
   *
   * First find the standard release behind the release group.
   */
  gameStatus.textContent =
    "Loading album...";

  trackList.innerHTML = "";

  scoreElement.textContent = "";

  submitButton.disabled = true;

  showScreen(gameScreen);

  try {
    const releaseResponse = await fetch(
      `${API_BASE_URL}/release-group/${album.id}/standard-release`
    );

    if (!releaseResponse.ok) {
      throw new Error(
        "Could not find the standard album release."
      );
    }

    const releaseData =
      await releaseResponse.json();

    const releaseId =
      releaseData.release?.id;

    if (!releaseId) {
      throw new Error(
        "No standard release was found."
      );
    }

    /*
     * Now get the actual tracklist.
     */
    const tracksResponse = await fetch(
      `${API_BASE_URL}/release/${releaseId}/tracks`
    );

    if (!tracksResponse.ok) {
      throw new Error(
        "Could not load the tracklist."
      );
    }

    const trackData =
      await tracksResponse.json();

    if (
      !trackData.tracks ||
      trackData.tracks.length === 0
    ) {
      throw new Error(
        "This album has no usable tracks."
      );
    }

    correctOrder =
      trackData.tracks.map((track) => ({
        title: track.title,
      }));

    startGame();
  } catch (error) {
    console.error(error);

    gameStatus.textContent =
      "Could not load this album. Try another album.";
  }
}


/* ---------------------------------------------------------
   START GAME
--------------------------------------------------------- */

function startGame() {
  gameStatus.textContent =
    "Put the tracks in the correct order:";

  scoreElement.textContent = "";

  submitButton.disabled = false;

  /*
   * Make a fresh copy every time.
   */
  tracks =
    correctOrder.map((track) => ({
      title: track.title,
    }));

  shuffle(tracks);

  renderTracks();
}


/* ---------------------------------------------------------
   SHUFFLE
--------------------------------------------------------- */

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j =
      Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] =
      [array[j], array[i]];
  }
}


/* ---------------------------------------------------------
   RENDER TRACKS
--------------------------------------------------------- */

function renderTracks() {
  trackList.innerHTML = "";

  tracks.forEach((track, index) => {
    const trackElement =
      document.createElement("div");

    trackElement.className =
      "track";

    trackElement.dataset.index =
      index;

    const number =
      document.createElement("div");

    number.className =
      "track-number";

    number.textContent =
      index + 1;

    const name =
      document.createElement("div");

    name.className =
      "track-name";

    name.textContent =
      track.title;

    const handle =
      document.createElement("div");

    handle.className =
      "drag-handle";

    handle.textContent =
      "☰";

    /*
     * Pointer events work with both mouse and touch.
     */
    handle.addEventListener(
      "pointerdown",
      startDragging
    );

    trackElement.appendChild(number);
    trackElement.appendChild(name);
    trackElement.appendChild(handle);

    trackList.appendChild(trackElement);
  });
}


/* ---------------------------------------------------------
   DRAGGING
--------------------------------------------------------- */

function startDragging(event) {
  event.preventDefault();

  draggedElement =
    event.currentTarget.parentElement;

  draggedElement.classList.add(
    "dragging"
  );

  document.addEventListener(
    "pointermove",
    moveDragging
  );

  document.addEventListener(
    "pointerup",
    stopDragging,
    { once: true }
  );
}


function moveDragging(event) {
  if (!draggedElement) {
    return;
  }

  const elements =
    [...trackList.querySelectorAll(".track:not(.dragging)")];

  const afterElement =
    getDragAfterElement(
      trackList,
      event.clientY
    );

  if (afterElement == null) {
    trackList.appendChild(
      draggedElement
    );
  } else {
    trackList.insertBefore(
      draggedElement,
      afterElement
    );
  }
}


function stopDragging() {
  if (!draggedElement) {
    return;
  }

  draggedElement.classList.remove(
    "dragging"
  );

  document.removeEventListener(
    "pointermove",
    moveDragging
  );

  updateTrackArrayFromDOM();

  draggedElement = null;
}


function getDragAfterElement(
  container,
  y
) {
  const elements =
    [
      ...container.querySelectorAll(
        ".track:not(.dragging)"
      ),
    ];

  return elements.reduce(
    (closest, child) => {
      const box =
        child.getBoundingClientRect();

      const offset =
        y -
        box.top -
        box.height / 2;

      if (
        offset < 0 &&
        offset > closest.offset
      ) {
        return {
          offset,
          element: child,
        };
      }

      return closest;
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
}


/* ---------------------------------------------------------
   UPDATE ARRAY AFTER DRAGGING
--------------------------------------------------------- */

function updateTrackArrayFromDOM() {
  const elements =
    [...trackList.querySelectorAll(".track")];

  tracks =
    elements.map((element) => ({
      title:
        element.querySelector(
          ".track-name"
        ).textContent,
    }));

  /*
   * Update visible position numbers.
   */
  elements.forEach((element, index) => {
    element
      .querySelector(".track-number")
      .textContent = index + 1;
  });
}


/* ---------------------------------------------------------
   SUBMIT
--------------------------------------------------------- */

submitButton.addEventListener(
  "click",
  submitGame
);


function submitGame() {
  updateTrackArrayFromDOM();

  let score = 0;

  trackList.innerHTML = "";

  tracks.forEach((track, index) => {
    const correctTrack =
      correctOrder[index];

    const trackElement =
      document.createElement("div");

    trackElement.className =
      "track";

    const number =
      document.createElement("div");

    number.className =
      "track-number";

    number.textContent =
      index + 1;

    const name =
      document.createElement("div");

    name.className =
      "track-name";

    name.textContent =
      track.title;

    const result =
      document.createElement("div");

    result.className =
      "result";

    if (
      track.title === correctTrack.title
    ) {
      score++;

      trackElement.classList.add(
        "track-correct"
      );

      result.classList.add(
        "correct"
      );

      result.textContent =
        "✓";
    } else {
      trackElement.classList.add(
        "track-incorrect"
      );

      result.classList.add(
        "incorrect"
      );

      const correctPosition =
        correctOrder.findIndex(
          (item) =>
            item.title === track.title
        ) + 1;

      result.textContent =
        `✗ #${correctPosition}`;
    }

    trackElement.appendChild(number);
    trackElement.appendChild(name);
    trackElement.appendChild(result);

    trackList.appendChild(trackElement);
  });

  scoreElement.textContent =
    `Score: ${score} / ${correctOrder.length}`;

  gameStatus.textContent =
    "Results:";

  submitButton.disabled = true;
}


/* ---------------------------------------------------------
   PLAY AGAIN
--------------------------------------------------------- */

playAgainButton.addEventListener(
  "click",
  () => {
    startGame();
  }
);


/* ---------------------------------------------------------
   BACK TO ARTISTS
--------------------------------------------------------- */

backToArtistsButton.addEventListener(
  "click",
  () => {
    artistList.innerHTML = "";

    artistStatus.textContent = "";

    showScreen(artistScreen);

    artistSearch.focus();
  }
);


/* ---------------------------------------------------------
   CHOOSE ANOTHER ALBUM
--------------------------------------------------------- */

chooseAlbumButton.addEventListener(
  "click",
  async () => {
    if (!currentArtist) {
      showScreen(artistScreen);
      return;
    }

    albumStatus.textContent =
      "Loading albums...";

    albumList.innerHTML = "";

    showScreen(albumScreen);

    try {
      const response = await fetch(
        `${API_BASE_URL}/artist/${currentArtist.id}/albums`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data =
        await response.json();

      albumList.innerHTML = "";

      data.albums.forEach((album) => {
        const button =
          document.createElement("button");

        button.className =
          "selection-button";

        const year =
          album.year
            ? ` (${album.year})`
            : "";

        button.textContent =
          `${album.title}${year}`;

        button.addEventListener(
          "click",
          () => selectAlbum(album)
        );

        albumList.appendChild(button);
      });

      albumStatus.textContent =
        "Choose an album:";
    } catch (error) {
      console.error(error);

      albumStatus.textContent =
        "Could not load the albums.";
    }
  }
);


/* ---------------------------------------------------------
   CHOOSE ANOTHER ARTIST
--------------------------------------------------------- */

chooseArtistButton.addEventListener(
  "click",
  () => {
    currentArtist = null;
    currentAlbum = null;

    artistSearch.value = "";

    artistList.innerHTML = "";

    artistStatus.textContent = "";

    showScreen(artistScreen);

    artistSearch.focus();
  }
);
