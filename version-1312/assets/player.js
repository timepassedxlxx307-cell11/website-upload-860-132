(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var stream = shell.getAttribute('data-stream');
    var playButton = shell.querySelector('.player-start');
    var controlPlay = shell.querySelector('[data-player-play]');
    var muteButton = shell.querySelector('[data-player-mute]');
    var fullButton = shell.querySelector('[data-player-fullscreen]');
    var state = shell.querySelector('[data-player-state]');
    var engine = null;

    function setState(text) {
      if (state) {
        state.textContent = text || '';
      }
    }

    function setup() {
      if (!video || !stream) {
        setState('播放准备失败');
        return;
      }
      var HlsCore = window.HlsPlayer;
      if (HlsCore && HlsCore.isSupported()) {
        engine = new HlsCore({ enableWorker: true, lowLatencyMode: true });
        engine.loadSource(stream);
        engine.attachMedia(video);
        engine.on(HlsCore.Events.MANIFEST_PARSED, function () {
          setState('');
        });
        engine.on(HlsCore.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === HlsCore.ErrorTypes.NETWORK_ERROR) {
            setState('正在重新连接');
            engine.startLoad();
          } else if (data.type === HlsCore.ErrorTypes.MEDIA_ERROR) {
            setState('正在恢复播放');
            engine.recoverMediaError();
          } else {
            setState('播放失败');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function playOrPause() {
      if (!video) {
        return;
      }
      if (video.paused) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setState('点击后开始播放');
          });
        }
      } else {
        video.pause();
      }
    }

    function updatePlayState() {
      var playing = video && !video.paused;
      shell.classList.toggle('is-playing', playing);
      if (controlPlay) {
        controlPlay.textContent = playing ? '暂停' : '播放';
      }
    }

    if (playButton) {
      playButton.addEventListener('click', playOrPause);
    }
    if (controlPlay) {
      controlPlay.addEventListener('click', playOrPause);
    }
    if (video) {
      video.addEventListener('click', playOrPause);
      video.addEventListener('play', updatePlayState);
      video.addEventListener('pause', updatePlayState);
      video.addEventListener('waiting', function () { setState('缓冲中'); });
      video.addEventListener('playing', function () { setState(''); });
      video.addEventListener('error', function () { setState('播放失败'); });
    }
    if (muteButton && video) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '静音' : '音量';
      });
    }
    if (fullButton) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }
    setup();
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
}());
