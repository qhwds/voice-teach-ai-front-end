<template>
  <div class="select-voice-container">
    <div class="select-voice-top">
      <div class="select-voice-top-title">
        选择配音
      </div>
      <div class="select-voice-top-close" @click="closeSelectVoice">
        <el-image src="src/assets/关  闭.png" alt="关闭" class="close-img" />
      </div>
    </div>
    <div class="select-voice-middle">
      <div class="select-voice-middle-container">
        <div
            class="select-voice-category"
            :class="{ 'active': selectedFilter === 'all' }"
            @click="filterVoices('all')"
        >
          全部音频 {{ totalAudioCount }}
        </div>
        <div
            class="select-voice-category"
            :class="{ 'active': selectedFilter === 'standard' }"
            @click="filterVoices('standard')"
        >
          标准库音频 {{ standardAudioCount }}
        </div>
        <div
            class="select-voice-category"
            :class="{ 'active': selectedFilter === 'user' }"
            @click="filterVoices('user')"
        >
          用户音频 {{ userAudioCount }}
        </div>
      </div>
    </div>
    <hr class="divider">
    <div class="select-voice-bottom">
      <div
          class="voice-card"
          v-for="voice in filteredVoices"
          :key="voice.voice_id"
          :class="{ 'active': selectedVoice === voice }"
          @click="handleVoiceClick(voice)"
      >
        <img
            :src="voice.reference_audio_path ? userStore.user.avatar_url : 'src/assets/default-icon.png'"
            alt="Voice Icon"
            class="voice-icon"
        />
        <div class="voice-name">{{ voice.voice_name }}</div>
        <div class="audio-play">
          <el-image
              :src="currentVoice === voice ? 'src/assets/tts暂停.png' : 'src/assets/tts播放.png'"
              fit="contain"
              class="tts-image"
              @click.stop="togglePlay(voice)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import {computed, ref} from "vue";
import { useVoiceStandardStore} from "@/stores/voice_standardStore.js";
const voiceStandardStore = useVoiceStandardStore();
import {ElImage} from "element-plus";
import {useVoiceUserStore} from "@/stores/Voice_userStore.js";
const uservoiceStore = useVoiceUserStore();
import { useUserStore } from '@/stores/userStore.js';
const userStore = useUserStore();

import {use_standardVoiceStore} from "@/stores/select_standardvoice_Store.js";
const select_standardVoiceStore = use_standardVoiceStore();
import {use_userVoiceStore} from "@/stores/select_uservoice_Store.js";
const select_userVoiceStore = use_userVoiceStore();

const voiceListstandard = ref([]); // 存储标准语音列表
voiceListstandard.value = voiceStandardStore.getStandardVoices;
const voiceList = ref([]); // 存储用户语音列表

const voiceListdetail = ref([]); // 存储详细语音 用户刚刚上传的
voiceList.value = uservoiceStore.getUserVoiceVoices;
// 当前选中的过滤类型
const selectedFilter = ref("all");
// 过滤后的语音列表
const filteredVoices = computed(() => {
  if (selectedFilter.value === "standard") {
    return voiceListstandard.value;
  } else if (selectedFilter.value === "user") {
    return voiceList.value;
  } else {
    return [...voiceListstandard.value, ...voiceList.value];
  }
});

// 语音总数
const totalAudioCount = computed(() => {
  return voiceListstandard.value.length + voiceList.value.length;
});

// 标准库语音数量
const standardAudioCount = computed(() => {
  return voiceListstandard.value.length;
});

// 用户语音数量
const userAudioCount = computed(() => {
  return voiceList.value.length;
});
// 过滤语音类型
const filterVoices = (type) => {
  selectedFilter.value = type;
};

// 当前正在播放的音频
const currentTrack = ref({
  id: null, // 当前音频的唯一 ID
  name: '', // 音频名称
  url: '', // 音频文件的 URL
  coverUrl: '', // 封面图的 URL（可选）
  duration: 0, // 音频总时长（秒）
});
const audio = new Audio(null);// 初始化音频实例，加载当前歌曲的音频文件
const selectedVoice = ref(null); // 当前选中的语音
const currentVoice = ref(null); // 当前播放的语音
// 播放状态
const isPlaying = ref(false);
const emit = defineEmits(['closeSelectVoice',]);
const closeSelectVoice = () => {
  emit('closeSelectVoice', false);
  console.log('closeSelectVoice');
  // 关闭选择器
};
const handleVoiceClick = (voice) => {
  if (voice.reference_audio_path) {
    playVoice(voice);
  } else if (voice.file_urls && voice.file_urls.reference_audio) {
    playuserVoice(voice);
  }
};
const playVoice = (voice) => {
  // 如果点击的是当前正在播放的语音
  if (selectedVoice.value === voice) {
    // 清空选中的语音并暂停音频
    selectedVoice.value = null;
    select_standardVoiceStore.resetVoice();
    console.log("清除选择的标准库音频:", select_standardVoiceStore.getVoice);
    return;
  }
  selectedVoice.value = voice;
  console.log("playVoice选择标准库的语音:", voice);
  select_standardVoiceStore.setVoice(voice);
  console.log("存储选择标准库的语音:", select_standardVoiceStore.getVoice);
  select_userVoiceStore.resetVoice();
  console.log("清除选择的用户库音频:", select_userVoiceStore.getVoice);

};
// 播放音频
const playAudio = () => {
  if (isPlaying.value) {
    console.warn("音频已经在播放中，无需重复调用播放方法");
    return;
  }

  if (!currentTrack.value || !currentTrack.value.url) {
    alert("没有可播放的音频文件！");
    return;
  }

  audio.src = currentTrack.value.url; // 设置音频文件的 URL
  audio.play()
      .then(() => {
        isPlaying.value = true; // 设置播放状态为 true
        console.log("开始播放音频:", currentTrack.value.name);
      })
      .catch((error) => {
        console.error("播放失败：", error);
      });
};
const togglePlay = (voice) => {
  console.log("togglePlay 当前语音:", voice);

  // 如果点击的是当前正在播放的语音
  if (currentVoice.value === voice) {
    // 清空选中的语音并暂停音频
    currentVoice.value = null;
    isPlaying.value = false; // 设置播放状态为 false
    audio.pause(); // 暂停音频
    console.log("暂停音频:", voice.voice_name);
    return;
  }

  // 如果点击的是其他语音
  currentVoice.value = voice; // 更新当前选中的语音
  currentTrack.value = {
    id: voice.voice_id, // 语音的唯一 ID
    name: voice.voice_name, // 音频名称
    url: voice.reference_audio_path, // 音频文件的 URL
    coverUrl: 'src/assets/logo.svg', // 封面图 URL，默认值
    duration: 0, // 如果后端返回时长，可以在这里赋值
  };
  //voice.reference_audio_path为空
  if (!currentTrack.value.url) {
    currentTrack.value = {
      id: voice.voice_id, // 语音的唯一 ID
      name: voice.voice_name, // 音频名称
      url: voice.file_urls.reference_audio, // 音频文件的 URL
      coverUrl: 'src/assets/logo.svg', // 封面图 URL，默认值
      duration: 0, // 如果后端返回时长，可以在这里赋值
    };
  }
  console.log("尝试播放的音频 URL:", currentTrack.value.url);

  // 播放音频
  playAudio();
};

const playuserVoice = (voice) => {
  if (selectedVoice.value === voice) {
    // 清空选中的语音并暂停音频
    selectedVoice.value = null;
    select_userVoiceStore.resetVoice();
    console.log("清除选择的用户库音频:", select_userVoiceStore.getVoice);
    return;
  }
  selectedVoice.value = voice;
  console.log("playuserVoice选择用户上传的语音:", voice);
  select_userVoiceStore.setVoice(voice);
  console.log("存储选择用户上传的语音:", select_userVoiceStore.getVoice);
  select_standardVoiceStore.resetVoice();
  console.log("清除选择的标准库音频:", select_standardVoiceStore.getVoice);
};
const playuserAudio = () => {
  if (isPlaying.value) {
    console.warn("音频已经在播放中，无需重复调用播放方法");
    return;
  }

  if (!currentTrack.value || !currentTrack.value.url) {
    alert("没有可播放的音频文件！");
    return;
  }

  audio.src = currentTrack.value.url; // 设置音频文件的 URL
  audio.play()
      .then(() => {
        isPlaying.value = true; // 设置播放状态为 true
        console.log("开始播放音频:", currentTrack.value.name);
      })
      .catch((error) => {
        console.error("播放失败：", error);
      });
};
const toggleuserPlay = (voice) => {
  console.log("toggleuserPlay 当前语音:", voice);

  // 如果点击的是当前正在播放的语音
  if (selectedVoice.value === voice) {
    // 清空选中的语音并暂停音频
    selectedVoice.value = null;
    isPlaying.value = false; // 设置播放状态为 false
    audio.pause(); // 暂停音频
    console.log("暂停音频:", voice.voice_name);
    return;
  }

  // 如果点击的是其他语音
  selectedVoice.value = voice; // 更新当前选中的语音
  currentTrack.value = {
    id: voice.voice_id, // 语音的唯一 ID
    name: voice.voice_name, // 音频名称
    url: voice.file_urls.reference_audio, // 音频文件的 URL
    coverUrl: 'src/assets/logo.svg', // 封面图 URL，默认值
    duration: 0, // 如果后端返回时长，可以在这里赋值
  };
  console.log("尝试播放的音频 URL:", currentTrack.value.url);

  // 播放音频
  playuserAudio();
};
</script>

<style scoped>
/* 优化后的样式 */
.hr-divider {
  border: none;
  border-top: 1px solid #e0e0e0; /* 更柔和的分割线 */
  margin: 20px 0;
}

.select-voice-container {
  width: 800px;
  height: 90%;

  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9); /* 更柔和的背景色 */
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
  overflow: hidden;
}

.select-voice-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: #f9f9f9; /* 顶部背景色 */
  border-bottom: 1px solid #e0e0e0; /* 顶部边框 */
}

.select-voice-top-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.select-voice-top-close {
  cursor: pointer;
}

.close-img {
  width: 20px;
  height: 20px;
}

.select-voice-middle {
  padding: 20px;
  text-align: center;
}

.select-voice-middle-container {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.select-voice-category {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background-color 0.3s, color 0.3s;
}

.select-voice-category:hover {
  background-color: #f0f0f0;
  color: #333;
}
.select-voice-category.active {
  background-color: #4299e1; /* 选中时的背景色 */
  color: white; /* 选中时的文字颜色 */
}

.select-voice-bottom {
  display: flex;
  overflow-y: auto;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 20px;
  gap: 20px;
}

.voice-card {
  width: 39%;
  height: 120px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.voice-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.voice-card.active {
  background-color: #e0f7fa; /* 选中时的背景色 */
  border-color: #4299e1; /* 选中时的边框颜色 */
}
.voice-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

.audio-play {
  margin-top: 10px;
}

.tts-image {
  width: 30px;
  height: 30px;
}
</style>