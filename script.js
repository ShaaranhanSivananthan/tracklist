const artists = [
  {
    name: "Kanye West",

    albums: [
      {
        name: "Graduation",

        versions: [
          {
            name: "Standard",

            tracks: [
              "Good Morning",
              "Champion",
              "Stronger",
              "I Wonder",
              "Good Life",
              "Can't Tell Me Nothing",
              "Barry Bonds",
              "Drunk and Hot Girls",
              "Flashing Lights",
              "Everything I Am",
              "The Glory",
              "Homecoming",
              "Big Brother"
            ]
          },

          {
            name: "Deluxe",

            tracks: [
              "Good Morning",
              "Champion",
              "Stronger",
              "I Wonder",
              "Good Life",
              "Can't Tell Me Nothing",
              "Barry Bonds",
              "Drunk and Hot Girls",
              "Flashing Lights",
              "Everything I Am",
              "The Glory",
              "Homecoming",
              "Big Brother"
            ]
          }
        ]
      },

      {
        name: "My Beautiful Dark Twisted Fantasy",

        versions: [
          {
            name: "Standard",

            tracks: [
              "Dark Fantasy",
              "Gorgeous",
              "POWER",
              "All of the Lights (Interlude)",
              "All of the Lights",
              "Monster",
              "So Appalled",
              "Devil in a New Dress",
              "Runaway",
              "Hell of a Life",
              "Blame Game",
              "Lost in the World",
              "Who Will Survive in America"
            ]
          },

          {
            name: "Deluxe",

            tracks: [
              "Dark Fantasy",
              "Gorgeous",
              "POWER",
              "All of the Lights (Interlude)",
              "All of the Lights",
              "Monster",
              "So Appalled",
              "Devil in a New Dress",
              "Runaway",
              "Hell of a Life",
              "Blame Game",
              "Lost in the World",
              "Who Will Survive in America"
            ]
          }
        ]
      }
    ]
  },


  {
    name: "Drake",

    albums: [
      {
        name: "Take Care",

        versions: [
          {
            name: "Standard",

            tracks: [
              "Over My Dead Body",
              "Shot for Me",
              "Headlines",
              "Crew Love",
              "Take Care",
              "Marvins Room",
              "Buried Alive",
              "Under Ground Kings",
              "We'll Be Fine",
              "Make Me Proud",
              "Lord Knows",
              "Cameras / Good Ones Go Interlude",
              "Doing It Wrong",
              "The Real Her",
              "Look What You've Done",
              "HYFR (Hell Ya Fucking Right)",
              "Practice",
              "The Ride"
            ]
          },

          {
            name: "Deluxe",

            tracks: [
              "Over My Dead Body",
              "Shot for Me",
              "Headlines",
              "Crew Love",
              "Take Care",
              "Marvins Room",
              "Buried Alive",
              "Under Ground Kings",
              "We'll Be Fine",
              "Make Me Proud",
              "Lord Knows",
              "Cameras / Good Ones Go Interlude",
              "Doing It Wrong",
              "The Real Her",
              "Look What You've Done",
              "HYFR (Hell Ya Fucking Right)",
              "Practice",
              "The Ride",
              "Hate Sleeping Alone"
            ]
          }
        ]
      }
    ]
  }
];


// -------------------------------------
// GAME STATE
// -------------------------------------

let currentArtist = null;
let currentAlbum = null;
let currentVersion = null;

let tracks = [];
let correctOrder = [];

let draggedTrack = null;


// -------------------------------------
// SCREEN ELEMENTS
// -------------------------------------

const artistScreen =
  document.getElementById("artist-screen");

const albumScreen =
  document.getElementById("album-screen");

const versionScreen =
  document.getElementById("version-screen");

const gameScreen =
  document.getElementById("game-screen");

const artistList =
  document.getElementById("artist-list");

const albumList =
  document.getElementById("album-list");

const versionList =
  document.getElementById("version-list");

const selectedArtist =
  document.getElementById("selected-artist");

const selectedAlbum =
  document.getElementById("selected-album");

const versionArtist =
  document.getElementById("version-artist");

const gameAlbum =
  document.getElementById("game-album");

const gameArtist =
  document.getElementById("game-artist");

const gameVersion =
  document.getElementById("game-version");

const trackList =
  document.getElementById("track-list");

const score =
  document.getElementById("score");

const submitButton =
  document.getElementById("submit-button");

const playAgainButton =
  document.getElementById("play-again-button");

const chooseAlbumButton =
  document.getElementById("choose-album-button");

const backToArtistsButton =
  document.getElementById("back-to-artists-button");

const backToAlbumsButton =
  document.getElementById("back-to-albums-button");


// -------------------------------------
// SCREEN MANAGEMENT
// -------------------------------------

function showScreen(screen) {
  artistScreen.style.display = "none";
  albumScreen.style.display = "none";
  versionScreen.style.display = "none";
  gameScreen.style.display = "none";

  screen.style.display = "block";
}


// -------------------------------------
// SHUFFLE
// -------------------------------------

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] =
      [array[j], array[i]];
  }
}


// -------------------------------------
// ARTIST SELECTION
// -------------------------------------

function displayArtists() {

  artistList.innerHTML = "";

  artists.forEach(function(artist, index) {

    const button =
      document.createElement("button");

    button.classList.add("selection-button");

    button.textContent = artist.name;

    button.addEventListener("click", function() {

      selectArtist(index);

    });

    artistList.appendChild(button);
  });
}


function selectArtist(index) {

  currentArtist = artists[index];

  selectedArtist.textContent =
    currentArtist.name;

  displayAlbums();

  showScreen(albumScreen);
}


// -------------------------------------
// ALBUM SELECTION
// -------------------------------------

function displayAlbums() {

  albumList.innerHTML = "";

  currentArtist.albums.forEach(
    function(album, index) {

      const button =
        document.createElement("button");

      button.classList.add("selection-button");

      button.textContent = album.name;

      button.addEventListener(
        "click",
        function() {

          selectAlbum(index);

        }
      );

      albumList.appendChild(button);
    }
  );
}


function selectAlbum(index) {

  currentAlbum =
    currentArtist.albums[index];

  selectedAlbum.textContent =
    currentAlbum.name;

  versionArtist.textContent =
    currentArtist.name;

  displayVersions();

  showScreen(versionScreen);
}


// -------------------------------------
// VERSION SELECTION
// -------------------------------------

function displayVersions() {

  versionList.innerHTML = "";

  currentAlbum.versions.forEach(
    function(version, index) {

      const button =
        document.createElement("button");

      button.classList.add("selection-button");

      button.textContent = version.name;

      button.addEventListener(
        "click",
        function() {

          selectVersion(index);

        }
      );

      versionList.appendChild(button);
    }
  );
}


function selectVersion(index) {

  currentVersion =
    currentAlbum.versions[index];

  startGame();
}


// -------------------------------------
// START GAME
// -------------------------------------

function startGame() {

  tracks =
    [...currentVersion.tracks];

  correctOrder =
    [...currentVersion.tracks];

  shuffle(tracks);

  gameAlbum.textContent =
    currentAlbum.name;

  gameArtist.textContent =
    currentArtist.name;

  gameVersion.textContent =
    currentVersion.name;

  score.textContent = "";

  submitButton.disabled = false;

  showScreen(gameScreen);

  displayTracks();
}


// -------------------------------------
// DISPLAY TRACKS
// -------------------------------------

function displayTracks() {

  trackList.innerHTML = "";

  tracks.forEach(function(track) {

    const trackElement =
      document.createElement("div");

    trackElement.classList.add("track");


    const handle =
      document.createElement("div");

    handle.classList.add("drag-handle");

    handle.textContent = "☷";


    const name =
      document.createElement("div");

    name.classList.add("track-name");

    name.textContent = track;


    trackElement.appendChild(handle);

    trackElement.appendChild(name);


    handle.addEventListener(
      "pointerdown",
      startDragging
    );


    trackList.appendChild(trackElement);
  });


  updateTrackNumbers();
}


// -------------------------------------
// TRACK NUMBERS
// -------------------------------------

function updateTrackNumbers() {

  const trackElements = [
    ...trackList.querySelectorAll(".track")
  ];

  trackElements.forEach(
    function(trackElement, index) {

      let number =
        trackElement.querySelector(
          ".track-number"
        );


      if (!number) {

        number =
          document.createElement("div");

        number.classList.add(
          "track-number"
        );

        trackElement.insertBefore(
          number,
          trackElement.firstChild
        );
      }


      number.textContent =
        (index + 1) + ".";
    }
  );
}


// -------------------------------------
// DRAGGING
// -------------------------------------

function startDragging(event) {

  event.preventDefault();

  draggedTrack =
    event.currentTarget.parentElement;

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


function moveTrack(event) {

  if (!draggedTrack) return;

  event.preventDefault();


  const otherTracks = [
    ...trackList.querySelectorAll(
      ".track:not(.dragging)"
    )
  ];


  const nextTrack =
    otherTracks.find(function(track) {

      const box =
        track.getBoundingClientRect();

      return event.clientY <
        box.top + box.height / 2;
    });


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


function stopDragging() {

  if (!draggedTrack) return;

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


// -------------------------------------
// CHECK ANSWER
// -------------------------------------

function checkAnswer() {

  const trackElements = [
    ...trackList.querySelectorAll(".track")
  ];

  let points = 0;


  trackElements.forEach(
    function(trackElement, index) {

      const trackName =
        trackElement
          .querySelector(".track-name")
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
        document.createElement("div");

      result.classList.add("result");


      if (
        trackName ===
        correctOrder[index]
      ) {

        points++;

        result.textContent = "✓";

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
          "✗ #" + correctPosition;

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


  submitButton.disabled = true;
}


// -------------------------------------
// PLAY AGAIN
// -------------------------------------

function playAgain() {

  tracks =
    [...currentVersion.tracks];

  correctOrder =
    [...currentVersion.tracks];

  shuffle(tracks);

  score.textContent = "";

  submitButton.disabled = false;

  displayTracks();
}


// -------------------------------------
// NAVIGATION
// -------------------------------------

function chooseAnotherAlbum() {

  currentVersion = null;

  displayAlbums();

  showScreen(albumScreen);
}


function goBackToArtists() {

  currentArtist = null;
  currentAlbum = null;
  currentVersion = null;

  showScreen(artistScreen);
}


function goBackToAlbums() {

  currentVersion = null;

  displayAlbums();

  showScreen(albumScreen);
}


// -------------------------------------
// BUTTON EVENTS
// -------------------------------------

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


backToArtistsButton.addEventListener(
  "click",
  goBackToArtists
);


backToAlbumsButton.addEventListener(
  "click",
  goBackToAlbums
);


// -------------------------------------
// INITIAL LOAD
// -------------------------------------

displayArtists();

showScreen(artistScreen);
