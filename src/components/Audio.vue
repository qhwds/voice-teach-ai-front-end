<template>
  <div class="audio-player">
    <!-- 音乐播放器的主容器 -->
    <!-- 顶部栏 -->
    <div class="top-bar">
      <!--      <button @click="goBack" class="btn-back">返回</button>-->
      <div class="title">{{ currentTrack?.name || '未知歌曲' }}</div>
      <el-dropdown @command="handleCommand">
        <span class="btn-share">
          <el-image
              src="src/assets/声音库更多.png"
              alt="更多"
              class="play-icon"
          />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="share">分享</el-dropdown-item>
            <el-dropdown-item command="download">下载</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 播放控制区 -->
    <div class="control-area">
      <img :src="currentTrack?.coverUrl" alt="封面" class="cover-image" />
      <div class="controls">
        <div class="progress-area">
          <el-slider v-model="currentTime" :min="0" :max="duration" :step="1" />
          <!-- 进度条输入框，绑定 currentTime 和 duration，拖动时调用 seek 方法 -->
          <div class="time-info">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            <!-- 显示当前时间和总时间，格式为 mm:ss -->
          </div>
        </div>
        <div class="control-buttons">
          <button @click="prevTrack" class="btn-control">上一曲</button>
          <button @click="togglePlay" class="btn-control">
            {{ isPlaying ? '暂停' : '播放' }}
          </button>
          <button @click="nextTrack" class="btn-control">下一曲</button>
          <button @click="togglePlayMode" class="btn-mode">
            {{ playMode }}
            <!-- 切换播放模式按钮，点击时调用 togglePlayMode 方法 -->
          </button>
        </div>
      </div>

    </div>
    <!-- 音频可视化区域 -->
    <div class="visualizer">
      <canvas ref="visualizerCanvas" class="visualizer-canvas"></canvas>
    </div>
    <!-- 音量和播放模式 -->
    <div class="volume-mode-area">
      <el-image
          src="src/assets/音量 (1).png"
          alt="音量"
          class="volume-img"
      />
      <el-slider v-model="volume" class="volume-slider" :min="0" :max="100" :step="1" />
      <!-- 音量调节滑块，绑定 volume 值，拖动时调用 setVolume 方法 -->
    </div>
    <div class="playlist-header">音频列表</div>
    <!-- 播放列表 -->
    <div class="playlist">
      <div
          v-for="(track, index) in playlist"
          :key="track.id"
          class="playlist-item"
          :class="{ active: currentTrackIndex === index }"
          @click="selectTrack(index)"
      >
        <div class="track-name">
          {{ track.name }}
        </div>
        <div class="track-duration">{{ formatTime(track.duration) }}</div>
        <div class="track-upload-time">{{ formatUploadTime(track.uploadTime) }}</div>
        <!-- 循环渲染播放列表，点击时调用 selectTrack 方法 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, computed, watch, onMounted} from 'vue';
import {ElImage, ElDropdown, ElDropdownItem, ElDropdownMenu} from "element-plus";

// 模拟播放列表数据
const playlist = reactive([
  {
    id: 1,
    coverUrl: 'src/assets/用户.png',
    audioURl: 'src/assets/穿越火线.mp3',
    lyrics: ['这是歌词1', '这是歌词2'],
    duration: 0, // 默认时长为 0
    uploadTime: new Date().toISOString(), // 初始化上传时间为当前时间
  },
  {
    id: 2,
    coverUrl: 'src/assets/用户.png',
    audioURl: 'src/assets/科技感介绍推介片头.mp3',
    lyrics: ['这是歌词3', '这是歌词4'],
    duration: 0, // 默认时长为 0
    uploadTime: new Date().toISOString(), // 初始化上传时间为当前时间
  },
  {
    id: 3,
    coverUrl: 'src/assets/用户.png',
    audioURl: 'src/assets/穿越火线.mp3',
    lyrics: ['这是歌词5', '这是歌词6'],
    duration: 0, // 默认时长为 0
    uploadTime: new Date().toISOString(), // 初始化上传时间为当前时间
  },
]);

// 当前播放的歌曲索引
const currentTrackIndex = ref(0);

// 当前播放的歌曲
const currentTrack = computed(() => playlist[currentTrackIndex.value]);// 根据索引计算当前歌曲

// 播放状态
const isPlaying = ref(false);

// 播放时间
const currentTime = ref(0); // 当前播放时间（秒）
const duration = ref(0); // 总时长

// 音量
const volume = ref(50); // 初始化音量为 50

// 播放模式
const playMode = ref('顺序'); // 初始化播放模式为“顺序”

const audio = new Audio(currentTrack.value.audioURl);// 初始化音频实例，加载当前歌曲的音频文件
// 播放控制函数
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;// 切换播放状态
  if (isPlaying.value) {
    playAudio();
    isPlaying.value = true;
  } else {
    audio.pause();
  }
};
// 监听音频加载完成事件
audio.addEventListener('loadedmetadata', () => {
  duration.value = Math.floor(audio.duration); // 设置总时长为音频的实际时长
  console.log('Duration set to:', duration.value); // 添加日志
});
// 更新进度条
audio.addEventListener('timeupdate', () => {
  currentTime.value = Math.floor(audio.currentTime); // 四舍五入以避免小数问题 实时更新当前播放时间
});
// 监听音频播放结束事件
audio.addEventListener('ended', () => {
  if (playMode.value === '单曲循环') {
    audio.currentTime = 0; // 重置当前播放时间
    playAudio();
    isPlaying.value = true;
  } else if (playMode.value === '随机') {
    const randomIndex = Math.floor(Math.random() * playlist.length); // 随机选择一首歌曲
    if (randomIndex === currentTrackIndex.value) {
      // 如果随机选择的歌曲与当前播放的歌曲相同，则重新选择
      nextTrack();
    }
    selectTrack(randomIndex);
  } else {
    nextTrack(); // 默认播放下一首
  }
});
// 监听当前播放歌曲的变化
watch(currentTrack, (newTrack) => {
  if (newTrack?.audioURl) {
    audio.src = newTrack.audioURl; // 更新音频源
    audio.load(); // 加载新的音频资源
    currentTime.value = 0; // 重置当前播放时间为 0
    duration.value = 0; // 重置总时长为 0
    // 提取歌曲名
    const songName = extractSongName(newTrack.audioURl);
    newTrack.name = songName;
    playAudio();//自动播放
    isPlaying.value = true;
  }
});
// 监听音量变化
watch(volume, (newVolume) => {
  if (audio) {
    audio.volume = newVolume / 100; // 将音量值从 0-100 转换为 0-1
  }
});
// 提取歌曲名
const extractSongName = (audioURl) => {
  const url = new URL(audioURl, window.location.origin);
  let fileName = url.pathname.split('/').pop(); // 获取文件名

  // 解码 URL 编码的字符
  fileName = decodeURIComponent(fileName);

  const songName = fileName.replace(/\.[^/.]+$/, ''); // 去掉文件扩展名
  return songName;
};
//初始化播放列表
const initializePlaylist = async () => {
  for (const track of playlist) {
    try {
      const tempAudio = new Audio(track.audioURl); // 创建临时音频实例
      await new Promise((resolve, reject) => {
        tempAudio.addEventListener('loadedmetadata', () => {
          track.duration = Math.floor(tempAudio.duration); // 获取时长并存储
          resolve();
        });
        tempAudio.addEventListener('error', (e) => {
          console.error('加载音频元数据失败:', e);
          track.duration = 0; // 如果加载失败，设置时长为 0
          reject(e);
        });
        tempAudio.load(); // 加载音频元数据
      });
      track.name = extractSongName(track.audioURl) || '未知歌曲'; // 提取歌曲名
    } catch (error) {
      console.error('获取歌曲时长失败：', error);
      track.duration = 0; // 如果获取失败，设置时长为 0
    }
  }
};
onMounted(async () => {
  await initializePlaylist(); // 初始化播放列表
});
// 播放音频
const playAudio = () => {
  audio.play().catch((error) => {
    console.error('播放失败：', error);
  })
};
// 选择指定索引的歌曲
const selectTrack = (index) => {
  currentTrackIndex.value = index;// 更新当前歌曲索引
};
// 上一首
const prevTrack = () => {
  currentTrackIndex.value =
      (currentTrackIndex.value - 1 + playlist.length) % playlist.length; // 计算上一曲的索引
};

//下一首
const nextTrack = () => {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.length;// 计算下一曲的索引
};
// 快进/快退
// const seek = () => {
//   audio.currentTime = Math.floor(currentTime.value); // 设置音频的当前播放时间为进度条的值
// };

// // 设置音量
// const setVolume = () => {
//   audio.volume = volume.value; // 设置音频的音量
// };

// 切换播放模式
const togglePlayMode = () => {
  const modes = ['顺序', '随机', '单曲循环']; // 定义播放模式列表
  const currentIndex = modes.indexOf(playMode.value); // 获取当前模式的索引
  playMode.value = modes[(currentIndex + 1) % modes.length]; // 切换到下一个模式
};

//点击更多
const handleCommand = (command) => {
  if (command === 'share') {
    shareTrack();
  } else if (command === 'download') {
    downloadTrack();
  }
};
//分享歌曲
const shareTrack = () => {
  console.log('分享歌曲:', currentTrack.value.name);
  // 这里可以集成实际的分享功能，例如调用分享 API
};
//下载歌曲
const downloadTrack = () => {
  const track = currentTrack.value;
  if (track && track.audioURl) {
    // 创建一个隐藏的 <a> 标签并触发点击事件以下载文件
    const link = document.createElement('a');
    link.href = track.audioURl.startsWith('http') ? track.audioURl : `${import.meta.env.BASE_URL}${track.audioURl}`;
    link.download = `${track.name}.mp3`; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error('无法下载歌曲，音频 URL 无效');
  }
};

// 时间格式化函数
const formatTime = (time) => {
  const minutes = Math.floor(time / 60); // 计算分钟数
  const seconds = Math.floor(time % 60); // 计算秒数
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; // 格式化为 mm:ss
};

// 格式化上传时间
const formatUploadTime = (uploadTime) => {
  const date = new Date(uploadTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 音频可视化
// 添加 Canvas 引用
const visualizerCanvas = ref(null);
// 初始化音频可视化
const initVisualizer = () => {
  const canvas = visualizerCanvas.value;
  const canvasCtx = canvas.getContext('2d');

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaElementSource(audio);

  source.connect(analyser);
  analyser.connect(audioContext.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'white';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];

      canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }
  };

  draw();
};

// 在组件挂载时初始化可视化
onMounted(() => {
  initVisualizer();
});

// 监听当前播放歌曲的变化，重新初始化可视化
watch(currentTrack, () => {
  initVisualizer();
});
</script>

<style scoped>
.visualizer {
  width: 100%;
  height: 150px;
  margin-top: 16px;
}

.visualizer-canvas {
  width: 100%;
  height: 100%;
  background-color: white;
}

.audio-player {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-inline-start: 250px;
}

.btn-back,
.btn-share {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.play-icon {
  width: 40px;
  height: 40px;
  fill: #007bff;
}

.control-area {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.cover-image {
  width: 100px;
  height: 100px;
  margin-right: 16px;
  border-radius: 8px;
}

.controls {
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
}

.btn-control {
  margin: 0 8px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-mode {
  margin: 0 8px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.progress-area {
  display: flex;
  width: 100%;
  align-items: center;
  margin-bottom: 16px;
}

.time-info {
  margin-inline-start: 20px;
  font-size: 14px;
}

.volume-mode-area {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 20px;
}

.volume-img {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.volume-slider {
  width: 100%;
  margin-right: 8px;
}

.playlist {
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.playlist-item {
  padding: 8px 0;
  margin: 10px 20px 10px 20px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  transition: transform 0.3s, box-shadow 0.3s;
}

.playlist-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.playlist-item.active {
  color: #007bff;
}

.track-name {
  font-size: 16px;
  font-weight: bold;
  margin-inline-start: 20px;
}

.track-duration {
  margin-top: 3px;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  margin-inline-start: 20px;
}

.track-upload-time {
  margin-top: 3px;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  margin-inline-start: 60px;
}
</style>