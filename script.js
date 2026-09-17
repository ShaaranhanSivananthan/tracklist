/* =========================================================
   TRACKLIST GAME

   Music data is kept here for now.

   Later, if you have a large number of artists/albums,
   you can move MUSIC_DATA into a separate music-data.js
   or JSON file.
========================================================= */

const MUSIC_DATA = [
  {
    name: "Kanye West",

    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Kanye_West_at_the_2009_Tribeca_Film_Festival_%28crop%29.jpg/800px-Kanye_West_at_the_2009_Tribeca_Film_Festival_%28crop%29.jpg",

    albums: [
      {
        title: "The College Dropout",

        year: 2004,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/a/a3/Kanyewest_collegedropout.jpg",

        theme: {
          bg: "#8C4A27",
          color: "#FFFFFF",
          accent: "#D49B4B"
        },

        tracks: [
          "Intro",
          "We Don't Care",
          "Graduation Day",
          "All Falls Down",
          "I'll Fly Away",
          "Spaceship",
          "Jesus Walks",
          "Never Let Me Down",
          "Get Em High",
          "Workout Plan",
          "The New Workout Plan",
          "Slow Jamz",
          "Breathe In Breathe Out",
          "School Spirit Skit 1",
          "School Spirit",
          "School Spirit Skit 2",
          "Lil Jimmy Skit",
          "Two Words",
          "Through the Wire",
          "Family Business",
          "Last Call"
        ]
      },

      {
        title: "Late Registration",

        year: 2005,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/f/f4/Late_registration.jpg",

        theme: {
          bg: "#4A3525",
          color: "#FFFFFF",
          accent: "#C59B27"
        },

        tracks: [
          "Wake Up Mr. West",
          "Heard 'Em Say",
          "Touch the Sky",
          "Gold Digger",
          "Skit #1",
          "Drive Slow",
          "My Way Home",
          "Crack Music",
          "Roses",
          "Bring Me Down",
          "Addiction",
          "Skit #2",
          "Diamonds From Sierra Leone (Remix)",
          "We Major",
          "Skit #3",
          "Hey Mama",
          "Celebration",
          "Skit #4",
          "Gone",
          "Diamonds From Sierra Leone"
        ]
      },

      {
        title: "Graduation",

        year: 2007,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_album.jpg",

        theme: {
          bg: "#8A2BE2",
          color: "#FFFFFF",
          accent: "#FF007F"
        },

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
        title: "My Beautiful Dark Twisted Fantasy",

        year: 2010,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/f/f0/My_Beautiful_Dark_Twisted_Fantasy.jpg",

        theme: {
          bg: "#B22222",
          color: "#FFFFFF",
          accent: "#FFD700"
        },

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
        title: "Yeezus",

        year: 2013,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/0/03/Yeezus_album_cover.png",

        theme: {
          bg: "#222222",
          color: "#FFFFFF",
          accent: "#FF0000"
        },

        tracks: [
          "On Sight",
          "Black Skinhead",
          "I Am a God",
          "New Slaves",
          "Hold My Liquor",
          "I'm in It",
          "Blood on the Leaves",
          "Guilt Trip",
          "Send It Up",
          "Bound 2"
        ]
      }
    ]
  },

  {
    name: "Kendrick Lamar",

    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Kendrick_Lamar_2018.jpg/800px-Kendrick_Lamar_2018.jpg",

    albums: [
      {
        title: "good kid, m.A.A.d city",

        year: 2012,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/d/d3/Good_kid_m.a.a.d_city_cover.jpg",

        theme: {
          bg: "#2F4F4F",
          color: "#FFFFFF",
          accent: "#00CED1"
        },

        tracks: [
          "Sherane a.k.a Master Splinter's Daughter",
          "Bitch, Don't Kill My Vibe",
          "Backseat Freestyle",
          "The Art of Peer Pressure",
          "Money Trees",
          "Poetic Justice",
          "good kid",
          "m.A.A.d city",
          "Swimming Pools (Drank)",
          "Sing About Me, I'm Dying of Thirst",
          "Real",
          "Compton"
        ]
      },

      {
        title: "To Pimp a Butterfly",

        year: 2015,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/f/f6/Kendrick_Lamar_-_To_Pimp_a_Butterfly.png",

        theme: {
          bg: "#1A1A1A",
          color: "#FFFFFF",
          accent: "#A9A9A9"
        },

        tracks: [
          "Wesley's Theory",
          "For Free? (Interlude)",
          "King Kunta",
          "Institutionalized",
          "These Walls",
          "u",
          "Alright",
          "For Sale? (Interlude)",
          "Momma",
          "Hood Politics",
          "How Much a Dollar Cost",
          "Complexion (A Zulu Love)",
          "The Blacker the Berry",
          "You Ain't Gotta Lie (Momma Said)",
          "i",
          "Mortal Man"
        ]
      },

      {
        title: "DAMN.",

        year: 2017,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Damn.png",

        theme: {
          bg: "#8B0000",
          color: "#FFFFFF",
          accent: "#FFFFFF"
        },

        tracks: [
          "BLOOD.",
          "DNA.",
          "YAH.",
          "ELEMENT.",
          "FEEL.",
          "LOYALTY.",
          "PRIDE.",
          "HUMBLE.",
          "LUST.",
          "LOVE.",
          "XXX.",
          "FEAR.",
          "GOD.",
          "DUCKWORTH."
        ]
      },

      {
        title: "Mr. Morale & the Big Steppers",

        year: 2022,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/e/e5/Kendrick_Lamar_-_Mr._Morale_%26_the_Big_Steppers.png",

        theme: {
          bg: "#5A4D41",
          color: "#FFFFFF",
          accent: "#D2B48C"
        },

        tracks: [
          "United in Grief",
          "N95",
          "Worldwide Steppers",
          "Die Hard",
          "Father Time",
          "Rich (Interlude)",
          "Rich Spirit",
          "We Cry Together",
          "Purple Hearts",
          "Count Me Out",
          "Crown",
          "Silent Hill",
          "Savior (Interlude)",
          "Savior",
          "Auntie Diaries",
          "Mr. Morale",
          "Mother I Sober",
          "Mirror"
        ]
      }
    ]
  },

  {
    name: "The Weeknd",

    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/The_Weeknd_Cannes_2023.see2_%28cropped%29.jpg/800px-The_Weeknd_Cannes_2023.see2_%28cropped%29.jpg",

    albums: [
      {
        title: "House of Balloons",

        year: 2011,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/2/22/House_Of_Balloons.png",

        theme: {
          bg: "#111111",
          color: "#FFFFFF",
          accent: "#E6E6E6"
        },

        tracks: [
          "High for This",
          "What You Need",
          "House of Balloons / Glass Table Girls",
          "The Morning",
          "Wicked Games",
          "The Party & The After Party",
          "Coming Down",
          "Loft Music",
          "The Knowing"
        ]
      },

      {
        title: "Beauty Behind the Madness",

        year: 2015,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/b/bd/The_Weeknd_-_Beauty_Behind_the_Madness.png",

        theme: {
          bg: "#2B2B2B",
          color: "#FFFFFF",
          accent: "#808080"
        },

        tracks: [
          "Real Life",
          "Losers",
          "Tell Your Friends",
          "Often",
          "The Hills",
          "Acquainted",
          "Can't Feel My Face",
          "Shameless",
          "Earned It",
          "In the Night",
          "As You Are",
          "Dark Times",
          "Prisoner",
          "Angel"
        ]
      },

      {
        title: "Starboy",

        year: 2016,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png",

        theme: {
          bg: "#1B003A",
          color: "#FFFFFF",
          accent: "#FF1493"
        },

        tracks: [
          "Starboy",
          "Party Monster",
          "False Alarm",
          "Reminder",
          "Rockin'",
          "Secrets",
          "True Colors",
          "Stargirl Interlude",
          "Sidewalks",
          "Six Feet Under",
          "Love to Lay",
          "A Lonely Night",
          "Attention",
          "Ordinary Life",
          "Nothing Without You",
          "All I Know",
          "Die for You",
          "I Feel It Coming"
        ]
      },

      {
        title: "After Hours",

        year: 2020,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png",

        theme: {
          bg: "#600000",
          color: "#FFFFFF",
          accent: "#FF3333"
        },

        tracks: [
          "Alone Again",
          "Too Late",
          "Hardest to Love",
          "Scared to Live",
          "Snowchild",
          "Escape from LA",
          "Heartless",
          "Faith",
          "Blinding Lights",
          "In Your Eyes",
          "Save Your Tears",
          "Repeat After Me (Interlude)",
          "After Hours",
          "Until I Bleed Out"
        ]
      },

      {
        title: "Dawn FM",

        year: 2022,

        cover:
          "https://upload.wikimedia.org/wikipedia/en/b/b9/The_Weeknd_-_Dawn_FM.png",

        theme: {
          bg: "#001F3F",
          color: "#FFFFFF",
          accent: "#00BFFF"
        },

        tracks: [
          "Dawn FM",
          "Gasoline",
          "How Do I Make You Love Me?",
          "Take My Breath",
          "Sacrifice",
          "A Tale By Quincy",
          "Out of Time",
          "Here We Go... Again",
          "Best Friends",
          "Is There Someone Else?",
          "Starry Eyes",
          "Every Angel is Terrifying",
          "Don't Break My Heart",
          "I Heard You're Married",
          "Less Than Zero",
          "Phantom Regret by Jim"
        ]
      }
    ]
  }
];

/* =========================================================
   DOM ELEMENTS
========================================================= */

const artistScreen =
  document.getElementById("artist-screen");

const albumScreen =
  document.getElementById("album-screen");

const gameScreen =
  document.getElementById("game-screen");

const artistList =
  document.getElementById("artist-list");

const albumList =
  document.getElementById("album-list");

const artistHeaderContainer =
  document.getElementById("artist-header-container");

const gameAlbumContainer =
  document.getElementById("game-album-container");

const gameStatus =
  document.getElementById("game-status");

const trackList =
  document.getElementById("track-list");

const submitButton =
  document.getElementById("submit-button");

const scoreElement =
  document.getElementById("score");

const gameControls =
  document.getElementById("game-controls");

const backToArtistsButton =
  document.getElementById("back-to-artists-button");

const playAgainButton =
  document.getElementById("play-again-button");

const chooseAlbumButton =
  document.getElementById("choose-album-button");

const chooseArtistButton =
  document.getElementById("choose-artist-button");

/* =========================================================
   GAME STATE
========================================================= */

let currentArtist = null;
let currentAlbum = null;

let correctOrder = [];

let draggedElement = null;

/* =========================================================
   THEME
========================================================= */

function applyTheme(theme = null) {
  const root = document.documentElement;

  if (!theme) {
    root.style.setProperty(
      "--bg-color",
      "#f2f2f2"
    );

    root.style.setProperty(
      "--card-bg",
      "#ffffff"
    );

    root.style.setProperty(
      "--text-color",
      "#222222"
    );

    root.style.setProperty(
      "--accent-color",
      "#222222"
    );

    root.style.setProperty(
      "--button-text-color",
      "#ffffff"
    );

    root.style.setProperty(
      "--button-hover",
      "#111111"
    );

    return;
  }

  root.style.setProperty(
    "--bg-color",
    theme.bg
  );

  root.style.setProperty(
    "--card-bg",
    adjustColorBrightness(theme.bg, 20)
  );

  root.style.setProperty(
    "--text-color",
    theme.color
  );

  root.style.setProperty(
    "--accent-color",
    theme.accent
  );

  const accentTextColor =
    getContrastColor(theme.accent);

  root.style.setProperty(
    "--button-text-color",
    accentTextColor
  );

  root.style.setProperty(
    "--button-hover",
    adjustColorBrightness(
      theme.accent,
      accentTextColor === "#FFFFFF"
        ? -12
        : 12
    )
  );
}

/*
  Adjusts a hex color by a percentage.

  This fixes the channel-order bug in the original version.
*/

function adjustColorBrightness(hex, percent) {
  const value = hex.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return hex;
  }

  const num =
    Number.parseInt(value, 16);

  const amount =
    Math.round(2.55 * percent);

  const r =
    clamp(
      (num >> 16) + amount
    );

  const g =
    clamp(
      ((num >> 8) & 0xff) + amount
    );

  const b =
    clamp(
      (num & 0xff) + amount
    );

  return (
    "#" +
    [r, g, b]
      .map(
        channel =>
          channel
            .toString(16)
            .padStart(2, "0")
      )
      .join("")
  );
}

function clamp(value) {
  return Math.max(
    0,
    Math.min(255, value)
  );
}

function getContrastColor(hex) {
  const value =
    hex.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return "#FFFFFF";
  }

  const r =
    Number.parseInt(
      value.slice(0, 2),
      16
    );

  const g =
    Number.parseInt(
      value.slice(2, 4),
      16
    );

  const b =
    Number.parseInt(
      value.slice(4, 6),
      16
    );

  const luminance =
    (
      0.299 * r +
      0.587 * g +
      0.114 * b
    ) / 255;

  return luminance > 0.58
    ? "#111111"
    : "#FFFFFF";
}

/* =========================================================
   IMAGE HELPER
========================================================= */

function createImage(
  src,
  alt,
  className,
  loading = "lazy"
) {
  const img =
    document.createElement("img");

  img.src = src;
  img.alt = alt;
  img.className = className;

  img.loading = loading;
  img.decoding = "async";

  return img;
}

/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function setScreen(screenToShow) {
  [
    artistScreen,
    albumScreen,
    gameScreen
  ].forEach(screen => {
    const visible =
      screen === screenToShow;

    screen.hidden = !visible;

    screen.classList.toggle(
      "screen-hidden",
      !visible
    );
  });
}

/* =========================================================
   ARTIST SCREEN
========================================================= */

function initArtistScreen() {
  currentArtist = null;
  currentAlbum = null;

  applyTheme();

  artistList.replaceChildren();

  MUSIC_DATA.forEach(artist => {
    /*
      Using a real button instead of a div makes the
      artist cards keyboard accessible.
    */

    const card =
      document.createElement("button");

    card.type = "button";
    card.className = "artist-card";

    const image =
      createImage(
        artist.image,
        artist.name,
        "artist-img"
      );

    const name =
      document.createElement("span");

    name.className =
      "artist-name-text";

    name.textContent =
      artist.name;

    card.append(
      image,
      name
    );

    card.addEventListener(
      "click",
      () => selectArtist(artist)
    );

    artistList.appendChild(card);
  });

  setScreen(artistScreen);
}

/* =========================================================
   ARTIST SELECTION
========================================================= */

function selectArtist(artist) {
  currentArtist = artist;

  applyTheme();

  artistHeaderContainer.replaceChildren();

  const artistImage =
    createImage(
      artist.image,
      artist.name,
      "header-artist-img",
      "eager"
    );

  const heading =
    document.createElement("h2");

  heading.textContent =
    artist.name;

  artistHeaderContainer.append(
    artistImage,
    heading
  );

  albumList.replaceChildren();

  artist.albums.forEach(album => {
    const card =
      document.createElement("button");

    card.type = "button";
    card.className = "album-card";

    card.style.borderColor =
      album.theme.accent;

    card.style.backgroundColor =
      album.theme.bg;

    card.style.color =
      album.theme.color;

    const image =
      createImage(
        album.cover,
        `${album.title} album cover`,
        "album-cover-img"
      );

    const info =
      document.createElement("span");

    info.className =
      "album-info";

    const title =
      document.createElement("span");

    title.className =
      "album-title";

    title.textContent =
      album.title;

    const year =
      document.createElement("span");

    year.className =
      "album-year";

    year.textContent =
      album.year;

    info.append(
      title,
      year
    );

    card.append(
      image,
      info
    );

    card.addEventListener(
      "click",
      () => selectAlbum(album)
    );

    albumList.appendChild(card);
  });

  setScreen(albumScreen);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   ALBUM SELECTION
========================================================= */

function selectAlbum(album) {
  currentAlbum = album;

  correctOrder = [
    ...album.tracks
  ];

  applyTheme(album.theme);

  gameAlbumContainer.replaceChildren();

  const cover =
    createImage(
      album.cover,
      `${album.title} album cover`,
      "game-album-cover",
      "eager"
    );

  const title =
    document.createElement("h2");

  title.textContent =
    album.title;

  const artist =
    document.createElement("p");

  artist.className =
    "artist-sub";

  artist.textContent =
    currentArtist.name;

  gameAlbumContainer.append(
    cover,
    title,
    artist
  );

  startGame();

  setScreen(gameScreen);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   START GAME
========================================================= */

function startGame() {
  gameStatus.textContent =
    "Put the tracks in the correct order:";

  scoreElement.textContent = "";

  submitButton.hidden = false;
  submitButton.disabled = false;

  gameControls.hidden = true;

  const shuffledTracks =
    [...correctOrder];

  /*
    Don't let the game occasionally start already solved.
  */

  if (shuffledTracks.length > 1) {
    do {
      shuffle(shuffledTracks);
    } while (
      shuffledTracks.every(
        (track, index) =>
          track === correctOrder[index]
      )
    );
  }

  renderTracks(shuffledTracks);
}

/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(array) {
  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() * (i + 1)
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

/* =========================================================
   RENDER TRACKS
========================================================= */

function renderTracks(tracks) {
  trackList.replaceChildren();

  tracks.forEach(
    (title, index) => {
      const trackElement =
        document.createElement("div");

      trackElement.className =
        "track";

      trackElement.dataset.trackTitle =
        title;

      trackElement.setAttribute(
        "role",
        "listitem"
      );

      const number =
        document.createElement("div");

      number.className =
        "track-number";

      number.textContent =
        index + 1;

      const name =
        document.createElement("div");

      name.className =
        "track-name";

      name.textContent =
        title;

      /*
        The handle itself is a button so keyboard users
        can focus it. The actual sorting is pointer based.
      */

      const handle =
        document.createElement("button");

      handle.type = "button";

      handle.className =
        "drag-handle";

      handle.setAttribute(
        "aria-label",
        `Drag ${title} to reorder`
      );

      handle.setAttribute(
        "title",
        "Drag to reorder"
      );

      handle.textContent =
        "☰";

      handle.addEventListener(
        "pointerdown",
        startDragging
      );

      trackElement.append(
        number,
        name,
        handle
      );

      trackList.appendChild(
        trackElement
      );
    }
  );
}

/* =========================================================
   POINTER DRAGGING
========================================================= */

function startDragging(event) {
  /*
    Only respond to primary pointer button.
  */

  if (
    event.button !== undefined &&
    event.button !== 0
  ) {
    return;
  }

  event.preventDefault();

  draggedElement =
    event.currentTarget.closest(
      ".track"
    );

  if (!draggedElement) {
    return;
  }

  draggedElement.classList.add(
    "dragging"
  );

  document.addEventListener(
    "pointermove",
    moveDragging
  );

  document.addEventListener(
    "pointerup",
    stopDragging,
    { once: true }
  );

  /*
    Important for mobile devices if a gesture is
    interrupted or cancelled.
  */

  document.addEventListener(
    "pointercancel",
    stopDragging,
    { once: true }
  );
}

function moveDragging(event) {
  if (!draggedElement) {
    return;
  }

  const afterElement =
    getDragAfterElement(
      trackList,
      event.clientY
    );

  if (afterElement === null) {
    trackList.appendChild(
      draggedElement
    );
  } else {
    trackList.insertBefore(
      draggedElement,
      afterElement
    );
  }
}

function stopDragging() {
  if (!draggedElement) {
    return;
  }

  draggedElement.classList.remove(
    "dragging"
  );

  document.removeEventListener(
    "pointermove",
    moveDragging
  );

  document.removeEventListener(
    "pointerup",
    stopDragging
  );

  document.removeEventListener(
    "pointercancel",
    stopDragging
  );

  updateTrackNumbers();

  draggedElement = null;
}

function getDragAfterElement(
  container,
  y
) {
  const elements = [
    ...container.querySelectorAll(
      ".track:not(.dragging)"
    )
  ];

  const closest =
    elements.reduce(
      (result, child) => {
        const box =
          child.getBoundingClientRect();

        const offset =
          y -
          box.top -
          box.height / 2;

        if (
          offset < 0 &&
          offset > result.offset
        ) {
          return {
            offset,
            element: child
          };
        }

        return result;
      },
      {
        offset:
          Number.NEGATIVE_INFINITY,

        element: null
      }
    );

  return closest.element;
}

/* =========================================================
   UPDATE TRACK NUMBERS
========================================================= */

function updateTrackNumbers() {
  [
    ...trackList.querySelectorAll(
      ".track"
    )
  ].forEach(
    (element, index) => {
      element.querySelector(
        ".track-number"
      ).textContent =
        index + 1;
    }
  );
}

/* =========================================================
   SUBMIT GAME
========================================================= */

function submitGame() {
  const elements = [
    ...trackList.querySelectorAll(
      ".track"
    )
  ];

  let score = 0;

  trackList.replaceChildren();

  elements.forEach(
    (element, index) => {
      const trackTitle =
        element.dataset.trackTitle;

      const isCorrect =
        trackTitle ===
        correctOrder[index];

      const resultTrack =
        document.createElement("div");

      resultTrack.className =
        `track ${
          isCorrect
            ? "track-correct"
            : "track-incorrect"
        }`;

      resultTrack.setAttribute(
        "role",
        "listitem"
      );

      const number =
        document.createElement("div");

      number.className =
        "track-number";

      number.textContent =
        index + 1;

      const name =
        document.createElement("div");

      name.className =
        "track-name";

      name.textContent =
        trackTitle;

      const result =
        document.createElement("div");

      result.className =
        `result ${
          isCorrect
            ? "correct"
            : "incorrect"
        }`;

      if (isCorrect) {
        score++;

        result.textContent =
          "✓";

        result.setAttribute(
          "aria-label",
          "Correct"
        );
      } else {
        const correctPosition =
          correctOrder.indexOf(
            trackTitle
          ) + 1;

        result.textContent =
          `✗ #${correctPosition}`;

        result.setAttribute(
          "aria-label",
          `Incorrect. Correct position: ${correctPosition}`
        );
      }

      resultTrack.append(
        number,
        name,
        result
      );

      trackList.appendChild(
        resultTrack
      );
    }
  );

  scoreElement.textContent =
    `Score: ${score} / ${correctOrder.length}`;

  gameStatus.textContent =
    "Results:";

  submitButton.hidden = true;

  gameControls.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   BUTTON EVENTS
========================================================= */

submitButton.addEventListener(
  "click",
  submitGame
);

backToArtistsButton.addEventListener(
  "click",
  initArtistScreen
);

chooseArtistButton.addEventListener(
  "click",
  initArtistScreen
);

chooseAlbumButton.addEventListener(
  "click",
  () => {
    if (currentArtist) {
      selectArtist(currentArtist);
    }
  }
);

playAgainButton.addEventListener(
  "click",
  startGame
);

/* =========================================================
   INITIALIZE
========================================================= */

initArtistScreen();
