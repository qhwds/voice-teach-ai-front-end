<template>
  <div class="audio-player">
    <!-- 音乐播放器的主容器 -->
    <!-- 顶部栏 -->
    <div class="top-bar">
      <div class="title">{{ currentTrack?.name || '未知歌曲' }}</div>

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
          <el-image src="src/assets/tts播放.png" fit="contain" class="tts-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

// 模拟播放列表数据
import {reactive, ref} from "vue";

// 示例响应式数据
const currentTrack = ref({
  name: '示例歌曲',
  coverUrl: 'path/to/cover.jpg',
});
const currentTime = ref(0);
const duration = ref(180); // 假设总时长为180秒

// 定义 formatTime 函数
const formatTime = (seconds) => {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
</script>

<style scoped>
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



.progress-area {
  display: flex;
  width: 100%;
  align-items: center;
  margin-bottom: 16px;
}

.time-info {
  width: 100px;
  margin-inline-start: 20px;
  font-size: 14px;
}

</style>