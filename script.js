let currentSong = new Audio();
let songs;
let currFolder;

// Function to convert seconds to minutes and seconds
function secondstominutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Ensure seconds is a positive integer
  seconds = Math.max(0, Math.floor(seconds));

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format with leading zeros
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //show all the songs in the playlist
  let songUL = document.querySelector(".songlists").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" src="svg/music.svg" alt="">
                   <div class="info">
                       <div>${song.replaceAll("%20", " ")} </div>
                       <div>Nitin</div>
                   </div>
                   <div class="playnow">
                       <span>Play now</span>
                       <img class="invert" src="svg/play.svg" alt="" style="padding-top: 8px;">
                   </div></li>`;
  }
  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songlists").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0];
      // Get the meta data of the folder
      if(folder && folder != "songs"){
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      // Create the card HTML
      cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#000000" stroke-width="1.5" fill="#82d604"/>
                <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="#000000" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`
    }
  }
} 

  //Load the library when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}
async function main() {
  //To get the list of all the songs
  await getSongs("songs/krsna");
  playMusic(songs[0], true);

  //To display all the albums on the page
  displayAlbums();

  //Attach an event listener to previous, play and next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondstominutes(
      currentSong.currentTime
    )}/${secondstominutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an event listener to Hamburger to open
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add an event listener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  //Add an event listener to previous button
  prev.addEventListener("click", () => {
    console.log("prev is clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //Add an event listener to next button
  next.addEventListener("click", () => {
    console.log("next is clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event listener to volume button
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      console.log("Setting volume to " + e.target.value + "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e =>{
      if(e.target.src.includes("svg/volume.svg")){
        e.target.src = "svg/mute.svg"
        currentSong.volume=0
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0
      }
      else{
        e.target.src = "svg/volume.svg"
        currentSong.volume = 0.1
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10
      }
    })


  //To Play the First song
  var audio = new Audio(songs[0]);
  //audio.play();

  audio.addEventListener("loadeddata", () => {
    audio.duration, audio.currentSrc, audio.currentTime;
  });
}
main()
