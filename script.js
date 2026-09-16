const tracks = [
  "Track 1",
  "Track 2",
  "Track 3",
  "Track 4",
  "Track 5"
];

const correctOrder = [
  "Track 1",
  "Track 2",
  "Track 3",
  "Track 4",
  "Track 5"
];

const trackList = document.getElementById("track-list");
const submitButton = document.getElementById("submit-button");
const score = document.getElementById("score");
const playAgainButton = document.getElementById("play-again-button");

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
    } else {
      result.textContent = "✗";
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
