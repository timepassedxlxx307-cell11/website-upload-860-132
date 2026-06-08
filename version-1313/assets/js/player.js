
import { H as Hls } from './video-player-dru42stk.js';

function initPlayer(player) {
    const video = player.querySelector('video[data-src]');
    const button = player.querySelector('[data-player-button]');
    const status = player.querySelector('[data-player-status]');

    if (!video || !button) {
        return;
    }

    let loaded = false;
    let hls = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function attachSource() {
        if (loaded) {
            return;
        }
        loaded = true;
        const src = video.dataset.src;
        setStatus('正在加载视频源...');

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('视频源已就绪');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus('网络错误，正在重试加载');
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus('媒体错误，正在尝试恢复');
                    hls.recoverMediaError();
                } else {
                    setStatus('视频暂时无法播放');
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', function () {
                setStatus('视频源已就绪');
            }, { once: true });
        } else {
            setStatus('当前浏览器不支持 HLS 播放');
        }
    }

    async function playVideo() {
        attachSource();
        try {
            await video.play();
        } catch (error) {
            setStatus('请再次点击播放，或检查浏览器自动播放权限');
        }
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
        setStatus('已暂停');
    });

    video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
        setStatus('播放结束');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
});
