const API_BASE_URL =
  "https://tracklist-api.shaaranhan-sivananthan.workers.dev";


/*
  GAME STATE
*/

let currentArtist = null;
let currentAlbum = null;
let currentVersion = null;

let tracks = [];
let correctOrder = [];

let draggedTrack = null;


/*
  CACHE

  These prevent us from repeatedly asking
  the API for the same information.
*/

const artistCache = new Map();
const albumCache = new Map();
const versionCache = new Map();
const trackCache = new Map();


/*
  SCREEN ELEMENTS
*/

const artistScreen =
  document.getElementById("artist-screen");

const albumScreen =
  document.getElementById("album-screen");

const versionScreen =
  document.getElementById("version-screen");

const gameScreen =
  document.getElementById("game-screen");


/*
  ARTIST ELEMENTS
*/

const artistSearch =
  document.getElementById("artist-search");

const artistSearchButton =
  document.getElementById("artist-search-button");

const artistStatus =
  document.getElementById("artist-status");

const artistList =
  document.getElementById("artist-list");


/*
  ALBUM ELEMENTS
*/

const selectedArtist =
  document.getElementById("selected-artist");

const albumStatus =
  document.getElementById("album-status");

const albumList =
  document.getElementById("album-list");


/*
  VERSION ELEMENTS
*/

const selectedAlbum =
  document.getElementById("selected-album");

const versionArtist =
  document.getElementById("version-artist");

const versionStatus =
  document.getElementById("version-status");

const versionList =
  document.getElementById("version-list");


/*
  GAME ELEMENTS
*/

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

const score =
  document.getElementById("score");


/*
  BUTTONS
*/

const submitButton =
  document.getElementById("submit-button");

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


/*
  SCREEN MANAGEMENT
*/

function showScreen(screen) {

  artistScreen.style.display = "none";

  albumScreen.style.display = "none";

  versionScreen.style.display = "none";

  gameScreen.style.display = "none";

  screen.style.display = "block";
}


/*
  API HELPER
*/

async function apiRequest(path) {

  if (
    API_BASE_URL ===
    "PASTE-YOUR-CLOUDFLARE-WORKER-URL-HERE"
  ) {
    throw new Error(
      "Your Cloudflare Worker URL has not been added to script.js."
    );
  }

  const response =
    await fetch(
      API_BASE_URL + path
    );

  if (!response.ok) {

    throw new Error(
      "The music service returned an error."
    );
  }

  return await response.json();
}


/*
  SMALL DELAY

  MusicBrainz requests should not be made
  too rapidly.

  This also makes the game more polite
  to the API.
*/

function wait(milliseconds) {

  return new Promise(function(resolve) {

    setTimeout(
      resolve,
      milliseconds
    );

  });
}


/*
  SHUFFLE
*/

function shuffle(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      array[i],
      array[j]
    ] = [
      array[j],
      array[i]
    ];
  }
}


/*
  ARTIST SEARCH
*/

async function searchArtists() {

  const query =
    artistSearch.value.trim();

  if (query.length < 2) {

    artistStatus.textContent =
      "Enter at least 2 characters.";

    return;
  }

  artistSearchButton.disabled = true;

  artistStatus.textContent =
    "Searching...";

  artistList.innerHTML = "";

  try {

    const cacheKey =
      query.toLowerCase();

    let data =
      artistCache.get(cacheKey);

    if (!data) {

      data =
        await apiRequest(
          "/search-artists?query=" +
          encodeURIComponent(query)
        );

      artistCache.set(
        cacheKey,
        data
      );
    }

    const artists =
      data.artists || [];

    if (artists.length === 0) {

      artistStatus.textContent =
        "No artists found.";

      return;
    }

    artistStatus.textContent =
      "Choose an artist:";

    displayArtists(artists);

  } catch (error) {

    console.error(error);

    artistStatus.textContent =
      "Something went wrong. Please try again.";

  } finally {

    artistSearchButton.disabled = false;
  }
}


/*
  DISPLAY ARTISTS
*/

function displayArtists(artists) {

  artistList.innerHTML = "";

  artists.forEach(function(artist) {

    const button =
      document.createElement("button");

    button.classList.add(
      "selection-button"
    );

    button.textContent =
      artist.name;

    button.addEventListener(
      "click",
      function() {

        selectArtist(artist);

      }
    );

    artistList.appendChild(button);

  });
}


/*
  SELECT ARTIST
*/

async function selectArtist(artist) {

  currentArtist = artist;

  currentAlbum = null;

  currentVersion = null;

  selectedArtist.textContent =
    currentArtist.name;

  albumList.innerHTML = "";

  albumStatus.textContent =
    "Loading albums...";

  showScreen(albumScreen);

  try {

    const cacheKey =
      currentArtist.id;

    let data =
      albumCache.get(cacheKey);

    if (!data) {

      data =
        await apiRequest(
          "/artist/" +
          encodeURIComponent(
            currentArtist.id
          ) +
          "/albums"
        );

      albumCache.set(
        cacheKey,
        data
      );

      await wait(1100);
    }

    displayAlbums(
      data["release-groups"] || []
    );

  } catch (error) {

    console.error(error);

    albumStatus.textContent =
      "Could not load this artist's albums.";

  }
}


/*
  DISPLAY ALBUMS
*/

function displayAlbums(albums) {

  albumList.innerHTML = "";

  /*
    Only show albums that have a title.

    We also remove duplicate album names.
  */

  const uniqueAlbums = [];

  const seenNames =
    new Set();

  albums.forEach(function(album) {

    if (!album.title) {
      return;
    }

    const key =
      album.title.toLowerCase();

    if (seenNames.has(key)) {
      return;
    }

    seenNames.add(key);

    uniqueAlbums.push(album);

  });


  /*
    Sort alphabetically for now.

    We can change this later to
    chronological order.
  */

  uniqueAlbums.sort(
    function(a, b) {

      return a.title.localeCompare(
        b.title
      );

    }
  );


  if (uniqueAlbums.length === 0) {

    albumStatus.textContent =
      "No albums found.";

    return;
  }

  albumStatus.textContent =
    "Choose an album:";


  uniqueAlbums.forEach(function(album) {

    const button =
      document.createElement("button");

    button.classList.add(
      "selection-button"
    );

    button.textContent =
      album.title;

    button.addEventListener(
      "click",
      function() {

        selectAlbum(album);

      }
    );

    albumList.appendChild(button);

  });
}


/*
  SELECT ALBUM
*/

async function selectAlbum(album) {

  currentAlbum = album;

  currentVersion = null;

  selectedAlbum.textContent =
    currentAlbum.title;

  versionArtist.textContent =
    currentArtist.name;

  versionList.innerHTML = "";

  versionStatus.textContent =
    "Loading versions...";

  showScreen(versionScreen);

  try {

    const cacheKey =
      currentAlbum.id;

    let data =
      versionCache.get(cacheKey);

    if (!data) {

      data =
        await apiRequest(
          "/release-group/" +
          encodeURIComponent(
            currentAlbum.id
          ) +
          "/releases"
        );

      versionCache.set(
        cacheKey,
        data
      );

      await wait(1100);
    }

    displayVersions(
      data.releases || []
    );

  } catch (error) {

    console.error(error);

    versionStatus.textContent =
      "Could not load album versions.";

  }
}


/*
  DISPLAY VERSIONS
*/

function displayVersions(releases) {

  versionList.innerHTML = "";

  /*
    Remove obvious duplicates.

    MusicBrainz can contain many releases
    for the same album because of different
    countries, dates and editions.
  */

  const uniqueReleases = [];

  const seen = new Set();

  releases.forEach(function(release) {

    if (!release.id) {
      return;
    }

    const title =
      release.title || currentAlbum.title;

    const date =
      release.date || "";

    const country =
      release.country || "";

    const key =
      title +
      "|" +
      date +
      "|" +
      country;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);

    uniqueReleases.push(release);

  });


  /*
    Sort by release date.
  */

  uniqueReleases.sort(
    function(a, b) {

      const dateA =
        a.date || "9999";

      const dateB =
        b.date || "9999";

      return dateA.localeCompare(
        dateB
      );

    }
  );


  /*
    Limit the number of versions
    displayed.

    This prevents albums with dozens
    of regional releases from becoming
    an enormous list.
  */

  const releasesToShow =
    uniqueReleases.slice(0, 20);


  if (releasesToShow.length === 0) {

    versionStatus.textContent =
      "No playable versions found.";

    return;
  }

  versionStatus.textContent =
    "Choose a version:";


  releasesToShow.forEach(
    function(release) {

      const button =
        document.createElement("button");

      button.classList.add(
        "selection-button"
      );


      let label =
        release.title ||
        currentAlbum.title;


      if (release.date) {

        label +=
          " — " +
          release.date;

      }


      if (release.country) {

        label +=
          " (" +
          release.country +
          ")";

      }


      button.textContent =
        label;


      button.addEventListener(
        "click",
        function() {

          selectVersion(release);

        }
      );


      versionList.appendChild(
        button
      );

    }
  );
}


/*
  SELECT VERSION
*/

async function selectVersion(release) {

  currentVersion = release;

  versionStatus.textContent =
    "Loading tracklist...";

  try {

    const cacheKey =
      currentVersion.id;

    let data =
      trackCache.get(cacheKey);

    if (!data) {

      data =
        await apiRequest(
          "/release/" +
          encodeURIComponent(
            currentVersion.id
          ) +
          "/tracks"
        );

      trackCache.set(
        cacheKey,
        data
      );

      await wait(1100);
    }

    const releaseTracks =
      extractTracks(data);


    if (releaseTracks.length < 2) {

      versionStatus.textContent =
        "This version does not have enough tracks to play.";

      return;
    }


    startGame(
      releaseTracks
    );

  } catch (error) {

    console.error(error);

    versionStatus.textContent =
      "Could not load this tracklist.";

  }
}


/*
  EXTRACT TRACKS FROM MUSICBRAINZ
*/

function extractTracks(data) {

  const result = [];

  /*
    MusicBrainz puts tracks inside
    media[].tracks[].

    We flatten multiple discs into
    one continuous tracklist.
  */

  if (
    !data.media ||
    !Array.isArray(data.media)
  ) {

    return result;
  }


  data.media.forEach(
    function(media) {

      if (
        !media.tracks ||
        !Array.isArray(media.tracks)
      ) {

        return;
      }


      media.tracks.forEach(
        function(track) {

          if (!track.title) {
            return;
          }

          result.push(
            track.title
          );

        }
      );

    }
  );


  return result;
}


/*
  START GAME
*/

function startGame(releaseTracks) {

  tracks =
    [...releaseTracks];

  correctOrder =
    [...releaseTracks];

  shuffle(tracks);


  gameAlbum.textContent =
    currentAlbum.title;

  gameArtist.textContent =
    currentArtist.name;


  let versionText =
    currentVersion.title ||
    "Standard";


  if (currentVersion.date) {

    versionText +=
      " — " +
      currentVersion.date;

  }


  if (currentVersion.country) {

    versionText +=
      " (" +
      currentVersion.country +
      ")";

  }


  gameVersion.textContent =
    versionText;


  score.textContent = "";

  gameStatus.textContent =
    "";

  submitButton.disabled =
    false;


  showScreen(
    gameScreen
  );

  displayTracks();
}


/*
  DISPLAY TRACKS
*/

function displayTracks() {

  trackList.innerHTML = "";


  tracks.forEach(
    function(track) {

      const trackElement =
        document.createElement("div");

      trackElement.classList.add(
        "track"
      );


      /*
        Drag handle
      */

      const handle =
        document.createElement("div");

      handle.classList.add(
        "drag-handle"
      );

      handle.textContent =
        "☷";


      /*
        Track name
      */

      const name =
        document.createElement("div");

      name.classList.add(
        "track-name"
      );

      name.textContent =
        track;


      trackElement.appendChild(
        handle
      );

      trackElement.appendChild(
        name
      );


      handle.addEventListener(
        "pointerdown",
        startDragging
      );


      trackList.appendChild(
        trackElement
      );

    }
  );


  updateTrackNumbers();
}


/*
  TRACK NUMBERS
*/

function updateTrackNumbers() {

  const trackElements = [
    ...trackList.querySelectorAll(
      ".track"
    )
  ];


  trackElements.forEach(
    function(
      trackElement,
      index
    ) {

      let number =
        trackElement.querySelector(
          ".track-number"
        );


      if (!number) {

        number =
          document.createElement(
            "div"
          );

        number.classList.add(
          "track-number"
        );


        trackElement.insertBefore(
          number,
          trackElement.firstChild
        );

      }


      number.textContent =
        (index + 1) +
        ".";

    }
  );
}


/*
  DRAGGING
*/

function startDragging(event) {

  event.preventDefault();


  draggedTrack =
    event.currentTarget
      .parentElement;


  draggedTrack.classList.add(
    "dragging"
  );


  document.addEventListener(
    "pointermove",
    moveTrack
  );


  document.addEventListener(
    "pointerup",
    stopDragging
  );

}


/*
  MOVE TRACK
*/

function moveTrack(event) {

  if (!draggedTrack) {
    return;
  }


  event.preventDefault();


  const otherTracks = [
    ...trackList.querySelectorAll(
      ".track:not(.dragging)"
    )
  ];


  const nextTrack =
    otherTracks.find(
      function(track) {

        const box =
          track.getBoundingClientRect();


        return event.clientY <
          box.top +
          box.height / 2;

      }
    );


  if (nextTrack) {

    trackList.insertBefore(
      draggedTrack,
      nextTrack
    );

  } else {

    trackList.appendChild(
      draggedTrack
    );

  }


  updateTrackNumbers();
}


/*
  STOP DRAGGING
*/

function stopDragging() {

  if (!draggedTrack) {
    return;
  }


  draggedTrack.classList.remove(
    "dragging"
  );


  document.removeEventListener(
    "pointermove",
    moveTrack
  );


  document.removeEventListener(
    "pointerup",
    stopDragging
  );


  draggedTrack = null;
}


/*
  CHECK ANSWER
*/

function checkAnswer() {

  const trackElements = [
    ...trackList.querySelectorAll(
      ".track"
    )
  ];


  let points = 0;


  trackElements.forEach(
    function(
      trackElement,
      index
    ) {

      const trackName =
        trackElement
          .querySelector(
            ".track-name"
          )
          .textContent;


      /*
        Remove previous result.
      */

      const oldResult =
        trackElement.querySelector(
          ".result"
        );


      if (oldResult) {
        oldResult.remove();
      }


      trackElement.classList.remove(
        "track-correct"
      );

      trackElement.classList.remove(
        "track-incorrect"
      );


      const result =
        document.createElement(
          "div"
        );

      result.classList.add(
        "result"
      );


      /*
        Correct position
      */

      if (
        trackName ===
        correctOrder[index]
      ) {

        points++;


        result.textContent =
          "✓";

        result.classList.add(
          "correct"
        );


        trackElement.classList.add(
          "track-correct"
        );

      } else {

        const correctPosition =
          correctOrder.indexOf(
            trackName
          ) + 1;


        result.textContent =
          "✗ #" +
          correctPosition;


        result.classList.add(
          "incorrect"
        );


        trackElement.classList.add(
          "track-incorrect"
        );

      }


      trackElement.appendChild(
        result
      );

    }
  );


  score.textContent =
    "Score: " +
    points +
    " / " +
    correctOrder.length;


  submitButton.disabled =
    true;
}


/*
  PLAY AGAIN
*/

function playAgain() {

  tracks =
    [...correctOrder];

  shuffle(tracks);


  score.textContent =
    "";

  gameStatus.textContent =
    "";

  submitButton.disabled =
    false;


  displayTracks();
}


/*
  CHOOSE ANOTHER ALBUM
*/

function chooseAnotherAlbum() {

  currentVersion =
    null;


  displayAlbumsForCurrentArtist();

}


/*
  DISPLAY CURRENT ARTIST'S ALBUMS
*/

function displayAlbumsForCurrentArtist() {

  if (!currentArtist) {
    return;
  }


  albumList.innerHTML = "";

  albumStatus.textContent =
    "Loading albums...";


  showScreen(
    albumScreen
  );


  const cacheKey =
    currentArtist.id;


  const data =
    albumCache.get(
      cacheKey
    );


  if (data) {

    displayAlbums(
      data["release-groups"] || []
    );

  } else {

    selectArtist(
      currentArtist
    );

  }
}


/*
  CHOOSE ANOTHER ARTIST
*/

function chooseAnotherArtist() {

  currentArtist =
    null;

  currentAlbum =
    null;

  currentVersion =
    null;

  artistSearch.value =
    "";

  artistStatus.textContent =
    "";

  artistList.innerHTML =
    "";

  showScreen(
    artistScreen
  );

}


/*
  BACK TO ARTISTS
*/

function goBackToArtists() {

  chooseAnotherArtist();

}


/*
  BACK TO ALBUMS
*/

function goBackToAlbums() {

  currentVersion =
    null;


  displayAlbumsForCurrentArtist();

}


/*
  EVENT LISTENERS
*/

artistSearchButton.addEventListener(
  "click",
  searchArtists
);


artistSearch.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key ===
      "Enter"
    ) {

      searchArtists();

    }

  }
);


submitButton.addEventListener(
  "click",
  checkAnswer
);


playAgainButton.addEventListener(
  "click",
  playAgain
);


chooseAlbumButton.addEventListener(
  "click",
  chooseAnotherAlbum
);


chooseArtistButton.addEventListener(
  "click",
  chooseAnotherArtist
);


backToArtistsButton.addEventListener(
  "click",
  goBackToArtists
);


backToAlbumsButton.addEventListener(
  "click",
  goBackToAlbums
);


/*
  START
*/

showScreen(
  artistScreen
);
