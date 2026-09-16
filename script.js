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
    trackElement.draggable = true;

    trackElement.addEventListener("dragstart", function() {
      trackElement.classList.add("dragging");
    });

    trackElement.addEventListener("dragend", function() {
      trackElement.classList.remove("dragging");
    });

    trackList.appendChild(trackElement);
  });
}

shuffle(tracks);
displayTracks();

trackList.addEventListener("dragover", function(event) {
  event.preventDefault();

  const draggingTrack = document.querySelector(".dragging");

  const tracks = [...trackList.querySelectorAll(".track:not(.dragging)")];

  const nextTrack = tracks.find(function(track) {
    const box = track.getBoundingClientRect();
    return event.clientY < box.top + box.height / 2;
  });

  if (nextTrack) {
    trackList.insertBefore(draggingTrack, nextTrack);
  } else {
    trackList.appendChild(draggingTrack);
  }
});
