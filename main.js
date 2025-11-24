document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素获取 ---
    const player = document.getElementById('biliPlayer');
    const video = document.getElementById('mainVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressContainer = document.getElementById('progressContainer');
    const progressFilled = document.getElementById('progressFilled');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const danmakuInput = document.getElementById('danmakuInput');
    const danmakuLayer = document.getElementById('danmakuLayer');
    const volumeBtn = document.getElementById('volumeBtn');

    // 初始状态：设置为暂停，以便显示中间的大按钮
    player.classList.add('paused');

    // --- 工具函数 ---
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // --- 1. 播放/暂停控制 ---
    function togglePlay() {
        if (video.paused || video.ended) {
            video.play();
        } else {
            video.pause();
        }
    }

    function updatePlayState() {
        if (video.paused) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            player.classList.add('paused');
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            player.classList.remove('paused');
        }
    }

    playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);

    // --- 2. 进度条与时间 ---
    video.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(video.duration);
    });

    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        progressFilled.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(video.currentTime);
    });

    // 进度条点击跳转
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        // 确保进度在 0 到 100% 之间
        video.currentTime = Math.max(0, Math.min(1, pos)) * video.duration;
    });

    // 进度条拖拽逻辑
    let isDragging = false;
    progressContainer.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = progressContainer.getBoundingClientRect();
            let pos = (e.clientX - rect.left) / rect.width;
            pos = Math.max(0, Math.min(1, pos));
            video.currentTime = pos * video.duration;
        }
    });

    // --- 3. 全屏控制 ---
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            // 请求全屏播放器容器
            player.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // --- 4. 弹幕系统 (模拟) ---
    const presetDanmaku = [
        "2333333", "前方高能预警", "好活当赏", "火钳刘明", "点赞投币收藏", "CSS太强了", "学到了！"
    ];

    function sendDanmaku(text) {
        const el = document.createElement('div');
        el.className = 'danmaku-item';
        el.textContent = text;
        
        // 随机高度 (0% - 70%)，避免遮挡控制栏
        const top = Math.random() * 70;
        el.style.top = `${top}%`;
        
        // 随机动画时长，模拟不同速度
        const duration = 5 + Math.random() * 5; 
        el.style.animationDuration = `${duration}s`;
        
        danmakuLayer.appendChild(el);

        // 动画结束后移除元素，清理 DOM
        el.addEventListener('animationend', () => {
            el.remove();
        });
    }

    // 自动发送预设弹幕（只有在播放时发送）
    setInterval(() => {
        if (!video.paused && Math.random() > 0.6) { // 随机发送，避免屏幕被瞬间占满
            const text = presetDanmaku[Math.floor(Math.random() * presetDanmaku.length)];
            sendDanmaku(text);
        }
    }, 800);

    // 发送自定义弹幕（按 Enter 键）
    danmakuInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && danmakuInput.value.trim() !== "") {
            sendDanmaku(danmakuInput.value);
            danmakuInput.value = "";
            danmakuInput.blur(); // 发送后失去焦点，方便使用空格键控制播放
        }
    });

    // --- 5. 快捷键支持 ---
    document.addEventListener('keydown', (e) => {
        // 如果焦点在输入框，则不触发播放器控制快捷键
        if (document.activeElement === danmakuInput) return;

        switch(e.code) {
            case 'Space': // 空格暂停/播放
                e.preventDefault(); // 阻止默认的滚动行为
                togglePlay();
                break;
            case 'ArrowRight': // 快进 5 秒
                video.currentTime += 5;
                break;
            case 'ArrowLeft': // 快退 5 秒
                video.currentTime -= 5;
                break;
        }
    });
    
    // 简单的音量静音/取消静音切换
    volumeBtn.addEventListener('click', () => {
         video.muted = !video.muted;
         // 简单地通过透明度反馈状态
         volumeBtn.style.opacity = video.muted ? '0.5' : '1';
    });
});