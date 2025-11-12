<template>
  <!-- 语音设置容器 -->
  <div class="set-voice-container">
    <!-- 语音设置顶部区域 -->
    <div class="set-voice-top">
      <!-- 语速设置滑块区域 -->
      <div class="set-voice-top-slider">
        <label>语速</label>
        <el-slider
          v-model="volume"
          class="volume-slider"
          :min="0.1"
          :max="2"
          :step="0.1"
          @change="updateVolume"
        />
      </div>
      <!-- 语音设置选择区域 -->
      <div class="set-voice-top-select">
        <!-- 第一行选择区域 -->
        <div class="set-voice-top-select-area">
          <!-- 语言选择 -->
          <div class="language-select">
            <label>语言</label>
            <el-select
              v-model="selectedLanguage"
              placeholder="选择语言"
              class="mt-20"
              clearable
              @change="updateSelectedLanguage"
            >
              <el-option
                v-for="lang in languages"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
              />
            </el-select>
          </div>
          <!-- 语气选择 -->
          <div class="tone-select">
            <label>语气选择</label>
            <el-select
              v-model="selectedScene"
              placeholder="选择语气"
              class="mt-20"
              clearable
              @change="updateSelectedScene"
            >
              <el-option
                v-for="tone in tones"
                :key="tone.value"
                :label="tone.label"
                :value="tone.value"
              />
            </el-select>
          </div>
        </div>
        <!-- 第二行选择区域 -->
        <div class="set-voice-top-select-area">
          <!-- 音频格式选择 -->
          <div class="format-select">
            <label>格式</label>
            <el-select
              v-model="selectedFormat"
              placeholder="选择音频格式"
              class="mt-20"
              clearable
              @change="updateSelectedFormat"
            >
              <el-option
                v-for="format in audioFormats"
                :key="format.value"
                :label="format.label"
                :value="format.value"
              />
            </el-select>
          </div>
          <!-- 节奏选择（注释掉，可根据需要启用） -->
          <!-- <div class="rhythm-select">
            <label>节奏选择</label>
            <el-select
              v-model="selectedRhythm"
              placeholder="选择节奏"
              class="mt-20"
              clearable
              @change="updateSelectedRhythm"
            >
              <el-option
                v-for="rhythm in rhythms"
                :key="rhythm.value"
                :label="rhythm.label"
                :value="rhythm.value"
              />
            </el-select>
          </div> -->
        </div>
      </div>
    </div>
    <!-- 分割线 -->
    <hr>
    <!-- 语音设置底部操作区域 -->
    <div class="set-voice-bottom" style="justify-content: space-between">
      <!-- 取消按钮 -->
      <el-button type="primary" @click="closeSetVoice">取消</el-button>
      <!-- 保存设置按钮 -->
      <el-button type="primary" @click="handleSetVoice">保存设置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useVoiceSettingsStore } from "@/stores/useVoiceSettingsStore"; // 根据实际路径调整

// 定义事件发射器
const emit = defineEmits(['closeSetVoice']);

// 获取语音设置存储实例
const store = useVoiceSettingsStore();

// 定义语言选项
const languages = ref([
  { value: 'zh', label: '中文' },
  { value: 'zh', label: '中英文' },
  { value: 'en', label: '英文' },
  { value: 'fr', label: '法语' },
  { value: 'es', label: '西班牙语' },
]);

// 定义语气选项
const tones = ref([
  { value: 'happy', label: '愉快' },
  { value: 'sad', label: '悲伤' },
  { value: 'neutral', label: '中性' },
  // 可添加更多语气选项
]);

// 定义节奏选项
const rhythms = ref([
  { value: 'slow', label: '慢速' },
  { value: 'medium', label: '中速' },
  { value: 'fast', label: '快速' },
  // 可添加更多节奏选项
]);

// 定义音频格式选项
const audioFormats = ref([
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV' },
  { value: 'flac', label: 'FLAC' },
  // 可添加更多格式选项
]);

// 封装计算属性创建函数
const createComputedProperty = (getter, setter) => {
  return computed({
    get: getter,
    set: setter,
  });
};

// 使用 store 中的状态
const volume = createComputedProperty(
  () => store.volume,
  (value) => store.setVolume(value)
);

const selectedLanguage = createComputedProperty(
  () => store.selectedLanguage,
  (value) => store.setSelectedLanguage(value)
);

const selectedScene = createComputedProperty(
  () => store.selectedScene,
  (value) => store.setSelectedScene(value)
);

const selectedFormat = createComputedProperty(
  () => store.selectedFormat,
  (value) => store.setSelectedFormat(value)
);

// 使用 store 中的状态
const selectedRhythm = createComputedProperty(
  () => {
    const value = store.selectedRhythm || '';
    console.log('selectedRhythm get:', value);
    return value;
  },
  (value) => {
    console.log('selectedRhythm set:', value);
    // 调用 setSelectedRhythm 方法
    if (typeof store.setSelectedRhythm === 'function') {
      store.setSelectedRhythm(value); 
    } else {
      console.error('store.setSelectedRhythm 不是一个函数');
    }
  }
);

// 定义更新节奏选择的方法
const updateSelectedRhythm = (value) => {
  console.log('updateSelectedRhythm:', value);
  // 调用 setSelectedRhythm 方法
  store.setSelectedRhythm(value); 
};

// 方法：更新音量
const updateVolume = () => {
  store.setVolume(volume.value);
};

// 方法：更新选择的语言
const updateSelectedLanguage = (value) => {
  store.setSelectedLanguage(value);
};

// 方法：更新选择的语气
const updateSelectedScene = (value) => {
  store.setSelectedScene(value);
};

// 方法：更新选择的格式
const updateSelectedFormat = (value) => {
  store.setSelectedFormat(value);
};

// 关闭设置面板
const closeSetVoice = () => {
  emit('closeSetVoice', false);
  console.log('closeSetVoice');
  // 如果需要重置状态，可以调用 store 的重置方法（如果定义了）
};

// 保存设置
const handleSetVoice = () => {
  // 你可以在这里执行保存操作，例如发送到服务器
  console.log('保存的设置:', {
    volume: store.volume,
    language: store.selectedLanguage,
    scene: store.selectedScene,
    format: store.selectedFormat,
    rhythm: store.selectedRhythm
  });
  // 关闭面板
  closeSetVoice();
};
</script>

<style scoped>
/* 添加 hr 样式 */
hr {
  border: 2px solid rgba(231, 222, 222, 0.6); /* 设置边框宽度和颜色 */
  border-radius: 10px;
  margin: 0 0; /* 设置上下外边距 */
}

.set-voice-container {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 20px;
  background: white;
  .set-voice-top {
    display: flex;
    flex-direction: column;
    padding: 20px;
    flex-wrap: wrap;
    gap: 20px;
    .set-voice-top-slider{
      display: flex;
      flex: 0 1 100%;
    }
    .set-voice-top-select {
      display: flex;
      flex-wrap: wrap;
      align-content: space-between;
      gap: 20px;
      .set-voice-top-select-area {
        display: flex;
        flex-basis: 100%;
        justify-content: space-between;
      }
      .language-select,
      .tone-select,
      .format-select,
      .rhythm-select {
        width: 50%;
      }
    }
  }
  .set-voice-bottom {
    display: flex;
    padding: 20px;
  }
}
</style>
