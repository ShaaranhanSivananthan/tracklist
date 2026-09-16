const albums = [
  {
    name: "Graduation",
    artist: "Kanye West",
    artwork: "https://upload.wikimedia.org/wikipedia/en/7/7d/Kanye_West_-_Graduation.jpg",
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
    name: "My Beautiful Dark Twisted Fantasy",
    artist: "Kanye West",
    artwork: "https://upload.wikimedia.org/wikipedia/en/f/f2/My_Beautiful_Dark_Twisted_Fantasy.jpg",
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
];

let currentAlbum = null;
let tracks = [];
let correctOrder = [];

const albumSelection = document.getElementById("album-selection");
const albumList = document.getElementById("album-list");

const gameScreen = document.getElementById("game-screen");
const albumNameElement = document.getElementById("album-name");
const artistNameElement = document.getElementById("artist-name");
const albumArtworkElement = document.getElementById("album-artwork");
const trackList = document.getElementById("track-list");
const submitButton = document.getElementById("submit-button");
const score = document.getElementById("score");
const playAgainButton = document.getElementById("play-again-button");
const albumSelectButton = document.getElementById("album-select-button");

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displayAlbums() {
  albumList.innerHTML = "";

  albums.forEach(function(album, index) {
    const button = document.createElement("button");

    button.classList.add("album-button");

    const artwork = document.createElement("img");
    artwork.src = album.artwork;
    artwork.alt = album.name + " album artwork";
    artwork.classList.add("album-artwork");

    const information = document.createElement("div");
    information.classList.add("album-information");

    information.innerHTML = `
      <strong>${album.name}</strong>
      <span>${album.artist}</span>
    `;

    button.appendChild(artwork);
    button.appendChild(information);

    button.addEventListener("click", function() {
      startGame(index);
    });

    albumList.appendChild(button);
  });
}

function startGame(albumIndex) {
  currentAlbum = albums[albumIndex];

  tracks = [...currentAlbum.tracks];
  correctOrder = [...currentAlbum.tracks];

  shuffle(tracks);

  albumNameElement.textContent = currentAlbum.name;
  artistNameElement.textContent = currentAlbum.artist;
  albumArtworkElement.src = currentAlbum.artwork;
  albumArtworkElement.alt = currentAlbum.name + " album artwork";

  score.textContent = "";

  albumSelection.style.display = "none";
  gameScreen.style.display = "block";

  displayTracks();
}

function displayTracks() {
  trackList.innerHTML = "";

  tracks.forEach(function(track) {
    const trackElement = document.createElement("div");
    trackElement.classList.add("track");

    const handle = document.createElement("div");
    handle.classList.add("drag-handle");
    handle.textContent = "☷";

    const name = document.createElement("div");
    name.classList.add("track-name");
    name.textContent = track;

    trackElement.appendChild(handle);
    trackElement.appendChild(name);

    handle.addEventListener("pointerdown", startDragging);

    trackList.appendChild(trackElement);
  });

  updateTrackNumbers();
}

function updateTrackNumbers() {
  const trackElements = [
    ...trackList.querySelectorAll(".track")
  ];

  trackElements.forEach(function(trackElement, index) {
    let number = trackElement.querySelector(".track-number");

    if (!number) {
      number = document.createElement("div");
      number.classList.add("track-number");
      trackElement.insertBefore(number, trackElement.firstChild);
    }

    number.textContent = (index + 1) + ".";
  });
}

let draggedTrack = null;

function startDragging(event) {
  event.preventDefault();

  draggedTrack = event.currentTarget.parentElement;
  draggedTrack.classList.add("dragging");

  document.addEventListener("pointermove", moveTrack);
  document.addEventListener("pointerup", stopDragging);
}

function moveTrack(event) {
  if (!draggedTrack) return;

  event.preventDefault();

  const otherTracks = [
    ...trackList.querySelectorAll(".track:not(.dragging)")
  ];

  const nextTrack = otherTracks.find(function(track) {
    const box = track.getBoundingClientRect();

    return event.clientY < box.top + box.height / 2;
  });

  if (nextTrack) {
    trackList.insertBefore(draggedTrack, nextTrack);
  } else {
    trackList.appendChild(draggedTrack);
  }

  updateTrackNumbers();
}

function stopDragging() {
  if (!draggedTrack) return;

  draggedTrack.classList.remove("dragging");

  document.removeEventListener("pointermove", moveTrack);
  document.removeEventListener("pointerup", stopDragging);

  draggedTrack = null;
}

function checkAnswer() {
  const trackElements = [
    ...trackList.querySelectorAll(".track")
  ];

  let points = 0;

  trackElements.forEach(function(trackElement, index) {
    const trackName = trackElement.querySelector(".track-name").textContent;

    const oldResult = trackElement.querySelector(".result");

    if (oldResult) {
      oldResult.remove();
    }

    trackElement.classList.remove("track-correct");
    trackElement.classList.remove("track-incorrect");

    const result = document.createElement("div");
    result.classList.add("result");

    if (trackName === correctOrder[index]) {
      points++;
      result.textContent = "✓";
      result.classList.add("correct");
      trackElement.classList.add("track-correct");
    } else {
      const correctPosition = correctOrder.indexOf(trackName) + 1;

      result.textContent = "✗ #" + correctPosition;
      result.classList.add("incorrect");
      trackElement.classList.add("track-incorrect");
    }

    trackElement.appendChild(result);
  });

  score.textContent = "Score: " + points + " / " + correctOrder.length;
}

function playAgain() {
  tracks = [...currentAlbum.tracks];

  shuffle(tracks);

  score.textContent = "";

  displayTracks();
}

function chooseAnotherAlbum() {
  gameScreen.style.display = "none";
  albumSelection.style.display = "block";

  score.textContent = "";
}

submitButton.addEventListener("click", checkAnswer);

playAgainButton.addEventListener("click", playAgain);

albumSelectButton.addEventListener("click", chooseAnotherAlbum);

displayAlbums();

gameScreen.style.display = "none";
