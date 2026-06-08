function setStatus(wrapper, message, isError) {
  var status = wrapper.querySelector("[data-player-status]");

  if (status) {
    status.textContent = message || "";
  }

  wrapper.classList.toggle("has-error", Boolean(isError));
  wrapper.classList.toggle("is-loading", Boolean(message) && !isError);
}

async function attachSource(video, sourceUrl) {
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = sourceUrl;
    return;
  }

  var module = await import("./hls-dru42stk.js");
  var Hls = module.H;

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(sourceUrl);
    hls.attachMedia(video);
    video._hlsInstance = hls;
    return;
  }

  throw new Error("当前浏览器不支持 HLS 播放");
}

async function startPlayer(wrapper) {
  var video = wrapper.querySelector("video");
  var sourceUrl = wrapper.getAttribute("data-video-url");

  if (!video || !sourceUrl) {
    setStatus(wrapper, "未找到播放源", true);
    return;
  }

  try {
    wrapper.classList.remove("has-error");
    setStatus(wrapper, "正在加载播放源...", false);

    if (!video.getAttribute("data-source-ready")) {
      await attachSource(video, sourceUrl);
      video.setAttribute("data-source-ready", "true");
    }

    wrapper.classList.add("is-playing");
    setStatus(wrapper, "", false);
    await video.play();
  } catch (error) {
    wrapper.classList.remove("is-playing");
    setStatus(wrapper, error && error.message ? error.message : "播放加载失败", true);
  }
}

function initPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (wrapper) {
    var overlay = wrapper.querySelector(".player-shell__overlay");
    var video = wrapper.querySelector("video");

    if (overlay) {
      overlay.addEventListener("click", function () {
        startPlayer(wrapper);
      });
    }

    if (video) {
      video.addEventListener("play", function () {
        wrapper.classList.add("is-playing");
      });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlayers);
} else {
  initPlayers();
}
