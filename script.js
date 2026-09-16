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

shuffle(tracks);
displayTracks();
