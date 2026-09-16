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
*/

const artistCache =
  new Map();

const albumCache =
  new Map();

const versionCache =
  new Map();

const trackCache =
  new Map();


/*
  SCREENS
*/

const artistScreen =
  document.getElementById(
    "artist-screen"
  );

const albumScreen =
  document.getElementById(
    "album-screen"
  );

const versionScreen =
  document.getElementById(
    "version-screen"
  );

const gameScreen =
  document.getElementById(
    "game-screen"
  );


/*
  ARTIST
*/

const artistSearch =
  document.getElementById(
    "artist-search"
  );

const artistSearchButton =
  document.getElementById(
    "artist-search-button"
  );

const artistStatus =
  document.getElementById(
    "artist-status"
  );

const artistList =
  document.getElementById(
    "artist-list"
  );


/*
  ALBUM
*/

const selectedArtist =
  document.getElementById(
    "selected-artist"
  );

const albumStatus =
  document.getElementById(
    "album-status"
  );

const albumList =
  document.getElementById(
    "album-list"
  );


/*
  VERSION
*/

const selectedAlbum =
  document.getElementById(
    "selected-album"
  );

const versionArtist =
  document.getElementById(
    "version-artist"
  );

const versionStatus =
  document.getElementById(
    "version-status"
  );

const versionList =
  document.getElementById(
    "version-list"
  );


/*
  GAME
*/

const gameAlbum =
  document.getElementById(
    "game-album"
  );

const gameArtist =
  document.getElementById(
    "game-artist"
  );

const gameVersion =
  document.getElementById(
    "game-version"
  );

const gameStatus =
  document.getElementById(
    "game-status"
  );

const trackList =
  document.getElementById(
    "track-list"
  );

const score =
  document.getElementById(
    "score"
  );


/*
  BUTTONS
*/

const submitButton =
  document.getElementById(
    "submit-button"
  );

const playAgainButton =
  document.getElementById(
    "play-again-button"
  );

const chooseAlbumButton =
  document.getElementById(
    "choose-album-button"
  );

const chooseArtistButton =
  document.getElementById(
    "choose-artist-button"
  );

const backToArtistsButton =
  document.getElementById(
    "back-to-artists-button"
  );

const backToAlbumsButton =
  document.getElementById(
    "back-to-albums-button"
  );


/*
  SCREEN MANAGEMENT
*/

function showScreen(
  screen
) {

  artistScreen.style.display =
    "none";

  albumScreen.style.display =
    "none";

  versionScreen.style.display =
    "none";

  gameScreen.style.display =
    "none";

  screen.style.display =
    "block";
}


/*
  API
*/

async function apiRequest(
  path
) {

  if (
    API_BASE_URL ===
    "PASTE-YOUR-CLOUDFLARE-WORKER-URL-HERE"
  ) {

    throw new Error(
      "Add your Cloudflare Worker URL to script.js."
    );

  }


  const response =
    await fetch(
      API_BASE_URL +
      path
    );


  if (!response.ok) {

    throw new Error(
      "API request failed."
    );

  }


  return await response.json();

}


/*
  SHUFFLE
*/

function shuffle(
  array
) {

  for (
    let i =
      array.length - 1;

    i > 0;

    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
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


  if (
    query.length < 2
  ) {

    artistStatus.textContent =
      "Enter at least 2 characters.";

    return;

  }


  artistSearchButton.disabled =
    true;


  artistStatus.textContent =
    "Searching...";


  artistList.innerHTML =
    "";


  try {

    const cacheKey =
      query.toLowerCase();


    let data =
      artistCache.get(
        cacheKey
      );


    if (!data) {

      data =
        await apiRequest(

          "/search-artists?query=" +
          encodeURIComponent(
            query
          )

        );


      artistCache.set(
        cacheKey,
        data
      );

    }


    const artists =
      data.artists || [];


    if (
      artists.length === 0
    ) {

      artistStatus.textContent =
        "No matching artists found.";

      return;

    }


    artistStatus.textContent =
      "Choose an artist:";


    displayArtists(
      artists
    );


  } catch (error) {

    console.error(
      error
    );


    artistStatus.textContent =
      "Could not search for artists.";


  } finally {

    artistSearchButton.disabled =
      false;

  }

}


/*
  ARTISTS
*/

function displayArtists(
  artists
) {

  artistList.innerHTML =
    "";


  artists.forEach(
    function(artist) {

      const button =
        document.createElement(
          "button"
        );


      button.classList.add(
        "selection-button"
      );


      button.textContent =
        artist.name;


      if (
        artist.disambiguation
      ) {

        button.textContent +=
          " — " +
          artist.disambiguation;

      }


      button.addEventListener(
        "click",
        function() {

          selectArtist(
            artist
          );

        }
      );


      artistList.appendChild(
        button
      );

    }
  );

}


/*
  SELECT ARTIST
*/

async function selectArtist(
  artist
) {

  currentArtist =
    artist;

  currentAlbum =
    null;

  currentVersion =
    null;


  selectedArtist.textContent =
    currentArtist.name;


  albumList.innerHTML =
    "";


  albumStatus.textContent =
    "Loading official albums...";


  showScreen(
    albumScreen
  );


  try {

    const cacheKey =
      currentArtist.id;


    let data =
      albumCache.get(
        cacheKey
      );


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

    }


    displayAlbums(
      data[
        "release-groups"
      ] || []
    );


  } catch (error) {

    console.error(
      error
    );


    albumStatus.textContent =
      "Could not load this artist's albums.";

  }

}


/*
  ALBUMS
*/

function displayAlbums(
  albums
) {

  albumList.innerHTML =
    "";


  if (
    albums.length === 0
  ) {

    albumStatus.textContent =
      "No official albums found.";

    return;

  }


  albumStatus.textContent =
    "Choose an album:";


  albums.forEach(
    function(album) {

      const button =
        document.createElement(
          "button"
        );


      button.classList.add(
        "selection-button"
      );


      let label =
        album.title;


      if (
        album[
          "first-release-date"
        ]
      ) {

        label +=
          " — " +
          album[
            "first-release-date"
          ];

      }


      button.textContent =
        label;


      button.addEventListener(
        "click",
        function() {

          selectAlbum(
            album
          );

        }
      );


      albumList.appendChild(
        button
      );

    }
  );

}


/*
  SELECT ALBUM
*/

async function selectAlbum(
  album
) {

  currentAlbum =
    album;

  currentVersion =
    null;


  selectedAlbum.textContent =
    currentAlbum.title;


  versionArtist.textContent =
    currentArtist.name;


  versionList.innerHTML =
    "";


  versionStatus.textContent =
    "Finding official editions...";


  showScreen(
    versionScreen
  );


  try {

    const cacheKey =
      currentAlbum.id;


    let data =
      versionCache.get(
        cacheKey
      );


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

    }


    displayVersions(
      data.releases || []
    );


  } catch (error) {

    console.error(
      error
    );


    versionStatus.textContent =
      "Could not load editions.";

  }

}


/*
  VERSIONS
*/

function displayVersions(
  releases
) {

  versionList.innerHTML =
    "";


  if (
    releases.length === 0
  ) {

    versionStatus.textContent =
      "No playable official edition was found.";

    return;

  }


  versionStatus.textContent =
    "Choose an edition:";


  releases.forEach(
    function(release) {

      const button =
        document.createElement(
          "button"
        );


      button.classList.add(
        "selection-button"
      );


      let label =
        release.tracklistType ||
        "Standard";


      const trackCount =
        release.trackCount;


      if (
        trackCount
      ) {

        label +=
          " — " +
          trackCount +
          " tracks";

      }


      button.textContent =
        label;


      button.addEventListener(
        "click",
        function() {

          selectVersion(
            release
          );

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

async function selectVersion(
  release
) {

  currentVersion =
    release;


  versionStatus.textContent =
    "Loading tracklist...";


  try {

    const cacheKey =
      currentVersion.id;


    let data =
      trackCache.get(
        cacheKey
      );


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

    }


    const releaseTracks =
      extractTracks(
        data
      );


    if (
      releaseTracks.length < 2
    ) {

      versionStatus.textContent =
        "This edition does not have enough tracks to play.";

      return;

    }


    startGame(
      releaseTracks
    );


  } catch (error) {

    console.error(
      error
    );


    versionStatus.textContent =
      "Could not load the tracklist.";

  }

}


/*
  TRACK EXTRACTION
*/

function extractTracks(
  data
) {

  const result = [];


  if (
    !Array.isArray(
      data.media
    )
  ) {

    return result;

  }


  const sortedMedia =
    [...data.media].sort(
      function(a, b) {

        return (
          Number(
            a.position || 0
          ) -
          Number(
            b.position || 0
          )
        );

      }
    );


  sortedMedia.forEach(
    function(media) {

      if (
        !Array.isArray(
          media.tracks
        )
      ) {

        return;

      }


      const sortedTracks =
        [...media.tracks].sort(
          function(a, b) {

            return (
              Number(
                a.position || 0
              ) -
              Number(
                b.position || 0
              )
            );

          }
        );


      sortedTracks.forEach(
        function(track) {

          const title =
            track.title ||
            (
              track.recording &&
              track.recording.title
            );


          if (title) {

            result.push(
              title
            );

          }

        }
      );

    }
  );


  return result;

}


/*
  START GAME
*/

function startGame(
  releaseTracks
) {

  correctOrder =
    [...releaseTracks];


  tracks =
    [...releaseTracks];


  shuffle(
    tracks
  );


  gameAlbum.textContent =
    currentAlbum.title;


  gameArtist.textContent =
    currentArtist.name;


  gameVersion.textContent =
    currentVersion.tracklistType ||
    "Standard";


  score.textContent =
    "";


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
  TRACK DISPLAY
*/

function displayTracks() {

  trackList.innerHTML =
    "";


  tracks.forEach(
    function(track) {

      const trackElement =
        document.createElement(
          "div"
        );


      trackElement.classList.add(
        "track"
      );


      const handle =
        document.createElement(
          "div"
        );


      handle.classList.add(
        "drag-handle"
      );


      handle.textContent =
        "☷";


      const name =
        document.createElement(
          "div"
        );


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
  NUMBERS
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
  DRAG
*/

function startDragging(
  event
) {

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
  MOVE
*/

function moveTrack(
  event
) {

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


        return (
          event.clientY <
          box.top +
          box.height / 2
        );

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
  STOP
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


  shuffle(
    tracks
  );


  score.textContent =
    "";


  gameStatus.textContent =
    "";


  submitButton.disabled =
    false;


  displayTracks();

}


/*
  CHOOSE ALBUM
*/

function chooseAnotherAlbum() {

  currentVersion =
    null;


  showScreen(
    albumScreen
  );


  albumStatus.textContent =
    "Choose an album:";

}


/*
  CHOOSE ARTIST
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
  BACK
*/

function goBackToArtists() {

  chooseAnotherArtist();

}


function goBackToAlbums() {

  chooseAnotherAlbum();

}


/*
  EVENTS
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
