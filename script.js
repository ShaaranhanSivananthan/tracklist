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

shuffle(tracks);

tracks.forEach(function(track) {
  const trackElement = document.createElement("div");

  trackElement.classList.add("track");
  trackElement.textContent = track;

  trackList.appendChild(trackElement);
});
