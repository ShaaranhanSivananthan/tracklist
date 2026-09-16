const tracks = [
  "Track 1",
  "Track 2",
  "Track 3",
  "Track 4",
  "Track 5"
];

const trackList = document.getElementById("track-list");

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
    trackElement.textContent = track;

    trackElement.addEventListener("pointerdown", startDragging);

    trackList.appendChild(trackElement);
  });
}

let draggedTrack = null;

function startDragging(event) {
  draggedTrack = event.currentTarget;

  draggedTrack.classList.add("dragging");

  draggedTrack.setPointerCapture(event.pointerId);

  draggedTrack.addEventListener("pointermove", moveTrack);
  draggedTrack.addEventListener("pointerup", stopDragging);
}

function moveTrack(event) {
  if (!draggedTrack) return;

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

function stopDragging(event) {
  draggedTrack.classList.remove("dragging");

  draggedTrack.releasePointerCapture(event.pointerId);

  draggedTrack.removeEventListener("pointermove", moveTrack);
  draggedTrack.removeEventListener("pointerup", stopDragging);

  draggedTrack = null;
}

shuffle(tracks);
displayTracks();
