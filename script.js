const albums = [
  {
    name: "Graduation",
    artist: "Kanye West",
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

const album = albums[0];

const tracks = [...album.tracks];

const correctOrder = [...album.tracks];

const albumNameElement = document.getElementById("album-name");
const artistNameElement = document.getElementById("artist-name");
const trackList = document.getElementById("track-list");
const submitButton = document.getElementById("submit-button");
const score = document.getElementById("score");
const playAgainButton = document.getElementById("play-again-button");

albumNameElement.textContent = album.name;
artistNameElement.textContent = album.artist;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
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
    }

    trackElement.appendChild(result);
  });

  score.textContent = "Score: " + points + " / " + correctOrder.length;
}

submitButton.addEventListener("click", checkAnswer);

function playAgain() {
  shuffle(tracks);
  displayTracks();

  score.textContent = "";
}

playAgainButton.addEventListener("click", playAgain);

shuffle(tracks);
displayTracks();
