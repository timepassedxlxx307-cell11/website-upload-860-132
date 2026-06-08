import { H as Hls } from "./hls-dru42stk.js";

function initPlayer(player) {
  var video = player.querySelector("video");
  var button = player.querySelector(".play-overlay");
  var stream = player.getAttribute("data-stream");
  var hls = null;
  var started = false;

  if (!video || !button || !stream) {
    return;
  }

  function start() {
    if (!started) {
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    button.classList.add("is-hidden");
    video.play().catch(function () {});
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll(".stream-player").forEach(initPlayer);
