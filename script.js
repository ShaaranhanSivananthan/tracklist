"use strict";


// ============================================================
// ELEMENTS
// ============================================================

const artistScreen = document.getElementById("artist-screen");
const albumScreen = document.getElementById("album-screen");
const gameScreen = document.getElementById("game-screen");
const resultsScreen = document.getElementById("results-screen");

const artistList = document.getElementById("artist-list");
const albumList = document.getElementById("album-list");

const albumSubtitle = document.getElementById("album-subtitle");

const gameCover = document.getElementById("game-cover");
const gameTitle = document.getElementById("game-title");
const gameStatus = document.getElementById("game-status");
const trackList = document.getElementById("track-list");

const submitButton = document.getElementById("submit-button");

const scoreElement = document.getElementById("score");
const resultsMessage = document.getElementById("results-message");
const resultsList = document.getElementById("results-list");

const backToArtistsButton = document.getElementById("back-to-artists");
const backToAlbumsButton = document.getElementById("back-to-albums");

const playAgainButton = document.getElementById("play-again-button");
const chooseAlbumButton = document.getElementById("choose-album-button");
const chooseArtistButton = document.getElementById("choose-artist-button");

const downloadResultButton = document.getElementById("download-result-button");
const shareResultButton = document.getElementById("share-result-button");
const copyResultButton = document.getElementById("copy-result-button");


// ============================================================
// GAME STATE
// ============================================================

let currentArtist = null;
let currentAlbum = null;
let currentTracks = [];


// ============================================================
// DEFAULT THEME
// ============================================================

const defaultTheme = {
    background: "#F4F4F4",
    text: "#171717",
    accent: "#222222"
};


// ============================================================
// SCREEN MANAGEMENT
// ============================================================

function showScreen(screenToShow) {

    const screens = [
        artistScreen,
        albumScreen,
        gameScreen,
        resultsScreen
    ];

    screens.forEach(screen => {
        screen.hidden = screen !== screenToShow;
    });

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}


// ============================================================
// THEME
// ============================================================

function hexToRgb(hex) {

    const cleanHex = hex.replace("#", "");

    const fullHex = cleanHex.length === 3
        ? cleanHex
            .split("")
            .map(character => character + character)
            .join("")
        : cleanHex;

    const number = parseInt(fullHex, 16);

    return {
        r: (number >> 16) & 255,
        g: (number >> 8) & 255,
        b: number & 255
    };
}


function rgbToHex(r, g, b) {

    return "#" + [r, g, b]
        .map(value =>
            Math.max(0, Math.min(255, Math.round(value)))
                .toString(16)
                .padStart(2, "0")
        )
        .join("");
}


function adjustColorBrightness(hex, amount) {

    const { r, g, b } = hexToRgb(hex);

    return rgbToHex(
        r + amount,
        g + amount,
        b + amount
    );
}


function getContrastColor(hex) {

    const { r, g, b } = hexToRgb(hex);

    const luminance =
        (0.299 * r) +
        (0.587 * g) +
        (0.114 * b);

    return luminance > 150
        ? "#111111"
        : "#FFFFFF";
}


function applyTheme(theme = defaultTheme) {

    const background = theme.background || defaultTheme.background;
    const text = theme.text || defaultTheme.text;
    const accent = theme.accent || defaultTheme.accent;

    document.documentElement.style.setProperty(
        "--bg-color",
        background
    );

    document.documentElement.style.setProperty(
        "--text-color",
        text
    );

    document.documentElement.style.setProperty(
        "--accent-color",
        accent
    );

    document.documentElement.style.setProperty(
        "--button-text",
        getContrastColor(accent)
    );

    document.documentElement.style.setProperty(
        "--card-bg",
        adjustColorBrightness(background, 15)
    );

    document.documentElement.style.setProperty(
        "--card-bg-hover",
        adjustColorBrightness(background, 25)
    );
}


// ============================================================
// IMAGE CREATION
// ============================================================

function createImage(src, alt, className, lazy = true) {

    const image = document.createElement("img");

    image.src = src;
    image.alt = alt;
    image.className = className;

    image.loading = lazy ? "lazy" : "eager";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";

    image.addEventListener("error", () => {

        image.classList.add("image-error");

        image.alt = `${alt} image unavailable`;

    });

    return image;
}


// ============================================================
// ARTIST SCREEN
// ============================================================

function renderArtists() {

    artistList.replaceChildren();

    applyTheme(defaultTheme);

    musicData.forEach(artist => {

        const card = document.createElement("button");

        card.type = "button";
        card.className = "artist-card";

        const image = createImage(
            artist.image,
            `${artist.name} photo`,
            "artist-image"
        );

        const name = document.createElement("span");

        name.className = "artist-name";
        name.textContent = artist.name;

        card.appendChild(image);
        card.appendChild(name);

        card.addEventListener("click", () => {
            selectArtist(artist);
        });

        artistList.appendChild(card);
    });
}


function selectArtist(artist) {

    currentArtist = artist;

    applyTheme(defaultTheme);

    albumSubtitle.textContent =
        `${artist.albums.length} albums available`;

    renderAlbums();

    showScreen(albumScreen);

    requestAnimationFrame(() => {
        backToArtistsButton.focus();
    });
}


// ============================================================
// ALBUM SCREEN
// ============================================================

function renderAlbums() {

    albumList.replaceChildren();

    currentArtist.albums.forEach(album => {

        const card = document.createElement("button");

        card.type = "button";
        card.className = "album-card";

        card.style.backgroundColor =
            album.theme?.background || defaultTheme.background;

        card.style.color =
            album.theme?.text || defaultTheme.text;

        const image = createImage(
            album.cover,
            `${album.name} album cover`,
            "album-cover"
        );

        const information = document.createElement("div");

        information.className = "album-information";

        const title = document.createElement("span");

        title.className = "album-name";
        title.textContent = album.name;

        const year = document.createElement("span");

        year.className = "album-year";
        year.textContent = album.year;

        information.appendChild(title);
        information.appendChild(year);

        card.appendChild(image);
        card.appendChild(information);

        card.addEventListener("click", () => {
            selectAlbum(album);
        });

        albumList.appendChild(card);
    });
}


function selectAlbum(album) {

    currentAlbum = album;

    applyTheme(album.theme);

    startGame();

    showScreen(gameScreen);

    requestAnimationFrame(() => {
        const firstTrack = trackList.querySelector(".track");

        if (firstTrack) {
            firstTrack.focus();
        }
    });
}


// ============================================================
// SHUFFLING
// ============================================================

function shuffleArray(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const randomIndex =
            Math.floor(Math.random() * (i + 1));

        [array[i], array[randomIndex]] =
            [array[randomIndex], array[i]];
    }

    return array;
}


function isCorrectOrder(tracks) {

    return tracks.every(
        (track, index) =>
            track === currentAlbum.tracks[index]
    );
}


function shuffleForGame(tracks) {

    if (tracks.length < 2) {
        return tracks;
    }

    let attempts = 0;

    do {

        shuffleArray(tracks);
        attempts++;

    } while (
        isCorrectOrder(tracks) &&
        attempts < 30
    );

    // Guarantees that a game with at least two tracks
    // won't accidentally begin already solved.
    if (isCorrectOrder(tracks)) {

        [tracks[0], tracks[1]] =
            [tracks[1], tracks[0]];
    }

    return tracks;
}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    currentTracks =
        shuffleForGame([...currentAlbum.tracks]);

    renderTracks();

    gameCover.src = currentAlbum.cover;
    gameCover.alt = `${currentAlbum.name} album cover`;

    gameTitle.textContent = currentAlbum.name;

    gameStatus.textContent =
        `Put all ${currentAlbum.tracks.length} tracks in the correct order.`;

    submitButton.disabled = false;
    submitButton.hidden = false;

    applyTheme(currentAlbum.theme);
}


// ============================================================
// TRACK RENDERING
// ============================================================

function renderTracks() {

    trackList.replaceChildren();

    currentTracks.forEach((title, index) => {

        const track = createTrackElement(title, index);

        trackList.appendChild(track);
    });
}


function createTrackElement(title, index) {

    const track = document.createElement("div");

    track.className = "track";
    track.draggable = false;
    track.tabIndex = 0;
    track.setAttribute("role", "listitem");

    track.dataset.title = title;

    const number = document.createElement("span");

    number.className = "track-number";
    number.textContent = index + 1;

    const trackTitle = document.createElement("span");

    trackTitle.className = "track-title";
    trackTitle.textContent = title;

    const dragHandle = document.createElement("button");

    dragHandle.type = "button";
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "☷";
    dragHandle.setAttribute(
        "aria-label",
        `Drag ${title}`
    );

    dragHandle.addEventListener(
        "pointerdown",
        startDragging
    );

    track.appendChild(number);
    track.appendChild(trackTitle);
    track.appendChild(dragHandle);

    updateTrackAccessibility(track, index);

    return track;
}


function updateTrackAccessibility(track, index) {

    const title = track.dataset.title;

    track.setAttribute(
        "aria-label",
        `Position ${index + 1}: ${title}`
    );
}


function updateTrackNumbers() {

    const tracks = [
        ...trackList.querySelectorAll(".track")
    ];

    tracks.forEach((track, index) => {

        const number =
            track.querySelector(".track-number");

        number.textContent = index + 1;

        updateTrackAccessibility(track, index);
    });

    currentTracks = getTracksFromDOM();
}


// ============================================================
// GET CURRENT ORDER
// ============================================================

function getTracksFromDOM() {

    return [
        ...trackList.querySelectorAll(".track")
    ].map(track => track.dataset.title);
}


// ============================================================
// DRAG AND DROP
// ============================================================

let draggedTrack = null;


function startDragging(event) {

    if (event.button !== undefined && event.button !== 0) {
        return;
    }

    event.preventDefault();

    const handle = event.currentTarget;

    draggedTrack = handle.closest(".track");

    if (!draggedTrack) {
        return;
    }

    draggedTrack.classList.add("dragging");

    handle.setPointerCapture?.(event.pointerId);

    document.addEventListener(
        "pointermove",
        moveDragging
    );

    document.addEventListener(
        "pointerup",
        stopDragging,
        { once: true }
    );

    document.addEventListener(
        "pointercancel",
        stopDragging,
        { once: true }
    );
}


function moveDragging(event) {

    if (!draggedTrack) {
        return;
    }

    event.preventDefault();

    const elementUnderPointer =
        document.elementFromPoint(
            event.clientX,
            event.clientY
        );

    const targetTrack =
        elementUnderPointer?.closest(".track");

    if (
        !targetTrack ||
        targetTrack === draggedTrack
    ) {
        return;
    }

    const rect =
        targetTrack.getBoundingClientRect();

    const targetMiddle =
        rect.top + (rect.height / 2);

    if (event.clientY < targetMiddle) {

        trackList.insertBefore(
            draggedTrack,
            targetTrack
        );

    } else {

        trackList.insertBefore(
            draggedTrack,
            targetTrack.nextSibling
        );
    }

    updateTrackNumbers();
}


function stopDragging() {

    if (draggedTrack) {

        draggedTrack.classList.remove(
            "dragging"
        );

        draggedTrack = null;
    }

    document.removeEventListener(
        "pointermove",
        moveDragging
    );
}


// ============================================================
// SUBMIT ANSWER
// ============================================================

function submitAnswer() {

    const playerOrder = getTracksFromDOM();
    const correctOrder = currentAlbum.tracks;

    let correctCount = 0;

    resultsList.replaceChildren();

    playerOrder.forEach((track, index) => {

        const correctTrack =
            correctOrder[index];

        const isCorrect =
            track === correctTrack;

        if (isCorrect) {
            correctCount++;
        }

        const result = document.createElement("div");

        result.className =
            `result-row ${isCorrect ? "correct" : "incorrect"}`;

        result.setAttribute("role", "listitem");

        const position = document.createElement("span");

        position.className = "result-position";
        position.textContent = index + 1;

        const answer = document.createElement("span");

        answer.className = "result-answer";
        answer.textContent = track;

        result.appendChild(position);
        result.appendChild(answer);

        if (!isCorrect) {

            const correction =
                document.createElement("span");

            correction.className =
                "correct-answer";

            correction.textContent =
                `Correct: ${correctTrack}`;

            result.appendChild(correction);
        }

        resultsList.appendChild(result);
    });

    const total = correctOrder.length;

    const percentage =
        Math.round((correctCount / total) * 100);

    scoreElement.textContent =
        `${correctCount} / ${total} correct (${percentage}%)`;

    resultsMessage.textContent =
        getResultsMessage(correctCount, total);

    submitButton.disabled = true;

    showScreen(resultsScreen);

    requestAnimationFrame(() => {
        playAgainButton.focus();
    });
}


function getResultsMessage(correct, total) {

    const percentage =
        (correct / total) * 100;

    if (percentage === 100) {
        return "Every track was in the correct position.";
    }

    if (percentage >= 75) {
        return "Most of the tracklist was in the correct position.";
    }

    if (percentage >= 50) {
        return "You got at least half of the positions correct.";
    }

    return "The correct tracklist is shown below for comparison.";
}


// ============================================================
// BUTTON ACTIONS
// ============================================================

backToArtistsButton.addEventListener(
    "click",
    () => {

        currentArtist = null;
        currentAlbum = null;

        applyTheme(defaultTheme);

        renderArtists();
        showScreen(artistScreen);
    }
);


backToAlbumsButton.addEventListener(
    "click",
    () => {

        currentAlbum = null;

        applyTheme(defaultTheme);

        renderAlbums();
        showScreen(albumScreen);
    }
);


submitButton.addEventListener(
    "click",
    submitAnswer
);


playAgainButton.addEventListener(
    "click",
    () => {

        startGame();
        showScreen(gameScreen);

        requestAnimationFrame(() => {

            const firstTrack =
                trackList.querySelector(".track");

            if (firstTrack) {
                firstTrack.focus();
            }
        });
    }
);


chooseAlbumButton.addEventListener(
    "click",
    () => {

        currentAlbum = null;

        applyTheme(defaultTheme);

        renderAlbums();
        showScreen(albumScreen);

        requestAnimationFrame(() => {
            backToAlbumsButton.focus();
        });
    }
);


chooseArtistButton.addEventListener(
    "click",
    () => {

        currentArtist = null;
        currentAlbum = null;

        applyTheme(defaultTheme);

        renderArtists();
        showScreen(artistScreen);
    }
);


// ============================================================
// INITIALIZE
// ============================================================

applyTheme(defaultTheme);
renderArtists();
showScreen(artistScreen);
