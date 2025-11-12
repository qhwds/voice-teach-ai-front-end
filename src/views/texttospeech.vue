<script setup>
import { ref, onMounted, onUnmounted ,nextTick ,reactive } from 'vue';
import SelectVoice from "@/components/select-voice.vue";
import SetVoice from "@/components/set-voice.vue";
import HistoryPage from "@/components/history-page.vue";
import {useUserStore} from "@/stores/userStore.js";
import { useAuthStore} from "@/stores/auth.js";
const userStore = useUserStore();
const authStore = useAuthStore();
import {use_standardVoiceStore} from "@/stores/select_standardvoice_Store.js";
const standardVoiceStore = use_standardVoiceStore();
import {use_userVoiceStore} from "@/stores/select_uservoice_Store.js";
const userVoiceStore = use_userVoiceStore();
import {useVoiceSettingsStore} from "@/stores/useVoiceSettingsStore.js";
const voiceSettingsStore = useVoiceSettingsStore();
import axios from "axios";
import { ElMessage } from 'element-plus';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
const jwtToken = authStore.accessToken;
// 存储所有生成的语音结果
const generatedResults = ref([
    
]);

const audioUrl = ref(''); // 生成的语音音频 URL
const text = ref('');
const language = ref('zh'); // 假设默认语言是中文
const settings = {
  pitch: 1.0,
  speed: 1.0,
  // 其他设置
};
const playURL=ref('');
const isGenerating = ref(false);
const generateVoice = async () => {
  if (!text.value.trim()) {
    alert('请输入文本');
    return;
  }
  try {
    // 开始加载
    isGenerating.value = true;
    // 定义 params 变量并初始化为空对象
    let params = {};
    //设置的参数
    console.log('voiceSettingsStore.getSelectedLanguage:', voiceSettingsStore);
    
    if(userVoiceStore.getVoice===null) {
      const baseUrl = "http://198.44.179.147:38316/";
      params = {
        refer_wav_path: standardVoiceStore.getVoice.reference_audio_path.replace(baseUrl, ''),
        prompt_text: standardVoiceStore.getVoice.reference_text,
        prompt_language: 'zh',
        text: text.value,
        text_language: voiceSettingsStore.selectedLanguage,
        speed: voiceSettingsStore.volume,
      };
      playURL.value = "http://20e62349.r9.cpolar.cn/tts?ref_audio_path=" + params.refer_wav_path + "&prompt_text=" + params.prompt_text + "&prompt_lang=" + params.prompt_language + "&text=" + params.text + "&text_language=" + params.text_language + "&speed=" + params.speed + "&text_split_method=cut5&streaming_mode=True&batch_size=8";
    }else {
      const baseUrl = "http://198.44.179.147:38316/";
      params = {
        refer_wav_path: userVoiceStore.getVoice.file_urls.reference_audio.replace(baseUrl, ''),
        prompt_text: userVoiceStore.getVoice.reference_text,
        prompt_language: 'zh',
        text: text.value,
        text_language: voiceSettingsStore.selectedLanguage,
        speed: voiceSettingsStore.volume,
      };
      playURL.value = "http://20e62349.r9.cpolar.cn/tts?ref_audio_path=" + params.refer_wav_path + "&prompt_text=" + params.prompt_text + "&prompt_lang=" + params.prompt_language + "&text=" + params.text + "&text_language=" + params.text_language + "&speed=" + params.speed + "&text_split_method=cut5&streaming_mode=True&batch_size=8";
    }
    // 发送 GET 请求，指定 responseType 为 'blob'
    console.log('playURL.value', playURL.value);
    console.log('请求参数:', params);
    // 请求头中添加用户 ID
    const headers = {
      'user_id': userStore.user.user_id,
    };
    console.log('请求头:', headers);
    //开始计时
    startTimer();
    const response = await axios.get('/serverB/tts', {
      params,
      headers,
      responseType: 'blob', // 指定响应类型为二进制数据
    });
    // 结束计时
    stopTimer();
    console.log('返回的音频流:', response.data);
    // // 添加时间戳以避免浏览器缓存
    // audioUrl.value += `?t=${Date.now()}`;
    // 将音频流转换为可播放的 URL
    const audioBlob = new Blob([response.data], { type: 'audio/ogg' }); // 根据实际 MIME 类型调整
    audioUrl.value = URL.createObjectURL(audioBlob);
    console.log('语音生成成功，音频 URL:', audioUrl.value);
    // 将生成的结果添加到数组中
    generatedResults.value.push({
      text: text.value,
      audioUrl: audioUrl.value
    });

    // 提示用户音频已生成
    ElMessage.success('音频已生成，请点击播放按钮试听');
  } catch (error) {
    console.error('生成语音失败:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
      alert(`生成语音失败，错误代码：${error.response.status}`);
    } else if (error.request) {
      console.error('没有收到响应:', error.request);
      alert('网络错误，请检查后端服务是否运行');
    } else {
      console.error('请求配置错误:', error.message);
      alert('请求配置错误，请联系开发者');
    }
  } finally {
    // 结束加载
    isGenerating.value = false;
  }
};
const selectedVoice = ref(null); // 当前选中的语音
const currentVoice = ref(null); // 当前播放的语音
const audio = new Audio(null);// 初始化音频实例，加载当前歌曲的音频文件
// 当前正在播放的音频
const currentTrack = ref({
  id: null, // 当前音频的唯一 ID
  name: '', // 音频名称
  url: '', // 音频文件的 URL
  coverUrl: '', // 封面图的 URL（可选）
  duration: 0, // 音频总时长（秒）
});
// 播放状态
const isPlaying = ref(false);
const togglePlay = (voice) => {
  console.log("togglePlay 当前语音:", voice);

  // 如果点击的是当前正在播放的语音
  if (currentVoice.value === voice) {
    // 清空选中的语音并暂停音频
    currentVoice.value = null;
    isPlaying.value = false; // 设置播放状态为 false
    audio.pause(); // 暂停音频
    console.log("暂停音频:", voice.test);
    return;
  }

  // 如果点击的是其他语音
  currentVoice.value = voice; // 更新当前选中的语音
  currentTrack.value = {
    // id: voice.voice_id, // 语音的唯一 ID
    name: voice.text, // 音频名称
    url: voice.audioUrl, // 音频文件的 URL
    coverUrl: 'src/assets/logo.svg', // 封面图 URL，默认值
  };
  console.log("尝试播放的音频 URL:", currentTrack.value.url);

  // 播放音频
  playAudio();
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
const isSelectVoiceVisible = ref(false);
const container = ref(null);
// 显示 SelectVoice 组件
const showSelectVoice = () => {
  isSelectVoiceVisible.value = true;
};
// 隐藏 SelectVoice 组件
const hideSelectVoice = () => {
  isSelectVoiceVisible.value = false;
};
// 监听全局点击事件，点击组件外部时隐藏 SelectVoice
const handleClickOutside = (event) => {
  if (container.value && !container.value.contains(event.target)) {
    hideSelectVoice();
    hideSetVoice();
    hideHistoryPage();
  }
};
onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
const isSetVoice = ref(false);
const showSetVoice = () => {
  isSetVoice.value = true;
};
const hideSetVoice = () => {
  isSetVoice.value = false;
};
const isHistoryPageVisible = ref(false);
const showHistoryPage = () => {
  isHistoryPageVisible.value = true;
};
const hideHistoryPage = () => {
  isHistoryPageVisible.value = false;
};

// 添加一个函数来隐藏所有模态框
const hideAllModals = () => {
  hideSelectVoice();
  hideSetVoice();
  hideHistoryPage();
};
// 下载音频的函数
const downloadAudio = (audioUrl) => {
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = 'generated_voice.ogg';
  link.click();
};

//实时输出音频部分
// 表单数据
const formData = reactive({
  text: text, 
  textLanguage: voiceSettingsStore.selectedLanguage || 'zh',
  refWavPath: 'KangHui.wav',
  promptText: '你赚多少钱，这与你无关，你为什么问这个问题？',
  promptLanguage: 'zh',
  speed: 1.0
});
// 定义一个函数来更新 formData
const updateFormData = () => {
  const baseUrl = "http://198.44.179.147:38316/";
  if(userVoiceStore.getVoice === null) {
    formData.refWavPath = standardVoiceStore.getVoice.reference_audio_path.replace(baseUrl, '');
    formData.promptText = standardVoiceStore.getVoice.reference_text;
    formData.textLanguage = voiceSettingsStore.selectedLanguage;
    formData.speed = voiceSettingsStore.volume;
  } else {
    formData.refWavPath = userVoiceStore.getVoice.file_urls.reference_audio.replace(baseUrl, '');
    formData.promptText = userVoiceStore.getVoice.reference_text;
    formData.textLanguage = voiceSettingsStore.selectedLanguage;
    formData.speed = voiceSettingsStore.volume;
  }
};
// 音频相关状态
const audioElement = ref(null);
const audioSrc = ref('');
const isLoading = ref(false);
const requestCount = ref(0); // 用于强制刷新音频
// 生成请求参数
const getRequestParams = () => {
  return {
    text: formData.text,
    text_language: formData.textLanguage.toLowerCase(),
    refer_wav_path: formData.refWavPath,
    prompt_text: formData.promptText,
    prompt_language: formData.promptLanguage.toLowerCase(),
    speed: formData.speed,
    // 其他固定参数...
    aux_ref_audio_paths: [],
    top_k: 5,
    top_p: 1,
    temperature: 1,
    text_split_method: "cut5",
    batch_size: 8,
    batch_threshold: 0.75,
    split_bucket: true,
    fragment_interval: 0.3,
    seed: -1,
    media_type: "ogg",
    streaming_mode: true,
    parallel_infer: true,
    repetition_penalty: 1.35,
    user_id: userStore.user.user_id, // 从用户信息中获取用户 ID
    _t: Date.now() // 添加时间戳防止缓存
  };
};
  
// 生成查询字符串
const generateQueryString = () => {
  // 更新 formData
    updateFormData();
  const params = getRequestParams();
  const query = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  console.log("流式输出请求数据",query);
  return query
};
const timer = ref(null); // 计时器
const elapsedTime = ref(0); // 记录经过的时间
// 生成新音频
const generateNewAudio = async () => {
  try {
    isLoading.value = true;
    requestCount.value++; // 每次请求增加计数

    const queryString = generateQueryString();
    // 开始计时
    startTimer();
    const response = await fetch(`/stream/stream_tts?${queryString}`);
    // 结束计时
    stopTimer();
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    console.log(response);


    // 强制更新音频源（添加随机参数防止缓存）
    audioSrc.value = `http://4f044f42.r9.cpolar.cn/stream_tts?${queryString}`;

    // 自动播放
    nextTick(() => {
      audioElement.value?.play().catch(e => {
        console.warn('自动播放被阻止:', e.message);
      });
    });

  } catch (error) {
    console.error('生成音频失败:', error);
  } finally {
    isLoading.value = false;
  }
};
// 错误处理
const handleAudioError = (e) => {
    console.error('音频加载失败:', e);
    // 可以在这里添加错误处理逻辑
};
// 开始计时函数
const startTimer = () => {
    elapsedTime.value = 0;
    timer.value = setInterval(() => {
        elapsedTime.value += 1; // 每次增加 1 毫秒
    }, 1); // 每 1 毫秒执行一次
};

const stopTimer = () => {
    clearInterval(timer.value);
    ElMessage.success(`语音生成响应耗时: ${elapsedTime.value} ms`);
    console.log(`语音生成耗时: ${elapsedTime.value} ms`);
};
// 文件输入框引用
const fileInput = ref(null);
// 处理文件导入
const handleFileImport = async () => {
    fileInput.value.click();
};

// 处理文件选择
const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();

    try {
        let fileContent = '';
        switch (fileExtension) {
            case 'txt':
                fileContent = await readTxtFile(file);
                break;
            case 'doc':
            case 'docx':
                fileContent = await readDocFile(file);
                break;
            default:
                alert('不支持的文件格式，请选择 TXT、DOC和DOCX。');
                return;
        }

        // 将文件内容显示在输入框中
        text.value = fileContent;
    } catch (error) {
        console.error('文件读取失败:', error);
        alert('文件读取失败，请检查文件或稍后重试。');
    }
};
// 新方法，用于同时触发两个请求
const generateBothVoices = async () => {
  try {
    // 调用 generateNewAudio 方法
    await generateNewAudio();
    // 调用 generateVoice 方法
    await generateVoice();
  } catch (error) {
    console.error('生成语音过程中出错:', error);
  }
};
// 读取 TXT 文件
const readTxtFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = () => {
            reject(new Error('TXT 文件读取失败'));
        };
        reader.readAsText(file);
    });
};

// 读取 DOC/DOCX 文件
const readDocFile = async (file) => {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
};

// 读取 PDF 文件
const readPdfFile = async (file) => {
    const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
    const pdf = await loadingTask.promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        textContent += strings.join(' ');
    }
    return textContent;
};
</script>

<template>
  <div class="tts-container">
    <div class="ai-teaching-platform">
      <header class="header">
        <h1>AI 驱动的教学语言伙伴</h1>
        <p class="subtitle">开启高效学习新体验</p>
      </header>
      <main class="main-content">
        <section class="introduction">
          <p>
            在教育数字化浪潮中，我们精心打造的基于 AI 的教学语言平台脱颖而出。突破传统教学局限，借助先进人工智能技术，为每一位学习者量身定制专属学习路径，让语言学习变得轻松高效，随时随地畅享优质教育资源。
          </p>
        </section>
      </main>
    </div>

    <div class="tts-main">
      <div class="tts-left-panel">
        <div class="text-input-section">
          <div class="section-header">
            <h2>文本输入</h2>
            <el-tooltip content="点击此按钮导入 TXT、DOC 或 DOCX 格式的文本文件" placement="top">
              <button @click="handleFileImport" class="import-file-btn">
              <i class="el-icon-document"></i>
              <span>导入文本文件</span>
            </button>
            </el-tooltip>
            <div class="text-count">{{ text.length }}/2000</div>
          </div>
          <div class="textarea-container">
            <textarea 
              v-model="text" 
              placeholder="请输入要转换的文本..." 
              rows="15"
              maxlength="2000"
            ></textarea>
          </div>
          
          <input 
              ref="fileInput"
              type="file"
              style="display: none;"
              @change="handleFileChange"
          />
        </div>

        <div class="voice-controls">
          <div class="control-buttons">
            <button class="control-btn select-voice" @click="showSelectVoice">
              <i class="el-icon-microphone"></i>
              <span>选择配音语音</span>
            </button>
            <button class="control-btn voice-settings" @click="showSetVoice">
              <i class="el-icon-setting"></i>
              <span>语音设置</span>
            </button>
          </div>
          <button class="generate-btn" @click="generateBothVoices">
            <i class="el-icon-video-play"></i>
            <span>生成语音</span>
          </button>
        </div>
      </div>

      <div class="tts-right-panel">
        <div class="result-header">
          <h2>AI 配音结果</h2>
          <!-- <div class="result-count">{{generatedResults.length}}</div> -->
          <button class="history-btn" @click="showHistoryPage">
            <i class="el-icon-time"></i>
            <span>历史记录</span>
          </button>
        </div>

        <!-- 音频播放器部分 -->
        <div class="audio-player">
          <audio
              ref="audioElement"
              controls
              :src = audioSrc
              type="audio/ogg; codecs=opus"
              @error="handleAudioError"
          ></audio>
          <!-- <button class="play-btn" @click="generateNewAudio" :disabled="isLoading">
            <i class="el-icon-play"></i>
            <i class="el-icon-play"></i>
            <span>{{ isLoading ? '生成中...' : '生成音频' }}</span>
          </button>
          <button 
            class="download-btn" 
            @click="audioSrc ? downloadAudio(audioSrc) : alert('暂无音频可下载')"
            :disabled="!audioSrc" 
          >
            <i class="el-icon-download"></i>
            <span>下载音频</span>
          </button> -->
        </div>
        <div v-if="isGenerating" class="loading">
        <p>正在生成语音卡片，请稍候...</p>
        </div>
        <div v-else class="select-voice-bottom">
          <div
              class="voice-card"
              v-for="(result, index) in generatedResults"
              :key="index"
              @click="togglePlay(result)"
          >
            <img
                :src="userStore.user.avatar_url"
                alt="Voice Icon"
                class="voice-icon"
            />
            <div class="voice-name" >
                {{ result.text }}
            </div>
            <div class="audio-play">
              <el-image
                  :src="currentVoice === result ? 'src/assets/tts暂停.png' : 'src/assets/tts播放.png'"
                  fit="contain"
                  class="tts-image"
                  @click.stop="togglePlay(result)"
              />
            </div>
            <div class="download-btn-container">
              <button
                  class="download-btn"
                  @click.stop="downloadAudio(result.audioUrl)"
              >
                <i class="el-icon-download"></i>
                <span><img src="@\assets\声音库下载.png" style="width: 40px;" class="download-icon" /></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框组件 -->
    <SelectVoice
      v-if="isSelectVoiceVisible"
      class="modal"
      @closeSelectVoice="hideSelectVoice"
    />
    <SetVoice
      v-if="isSetVoice"
      class="modal"
      @closeSetVoice="hideSetVoice"
    />
    <HistoryPage
      v-if="isHistoryPageVisible"
      class="modal"
      @closeHistory="hideHistoryPage"
    />

    <!-- 模态框遮罩层 -->
    <div 
      v-if="isSelectVoiceVisible || isSetVoice || isHistoryPageVisible"
      class="modal-overlay"
      @click="hideAllModals"
    ></div>
  </div>
</template>

<style scoped>
.tts-container {
  min-height: 100vh;

  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 2rem;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.ai-teaching-platform {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.introduction {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  color: #666;
  line-height: 1.6;
}

.tts-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.tts-left-panel, .tts-right-panel {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}
.voice-card {
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
.text-count {
  color: #666;
  font-size: 0.9rem;
}

.textarea-container {
  margin-bottom: 1.5rem;
}

textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  line-height: 1.6;
  resize: none;
  transition: border-color 0.3s;
}

textarea:focus {
  outline: none;
  border-color: #4299e1;
}

.voice-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-buttons {
  display: flex;
  gap: 1rem;
}

.control-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
}

.control-btn:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  background: #4299e1;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn:hover {
  background: #3182ce;
  transform: translateY(-2px);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.result-count {
  background: #e2e8f0;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  color: #4a5568;
}

.history-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
}

.history-btn:hover {
  background: #edf2f7;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #a0aec0;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.audio-player {
  width: 100%;
}

.audio-player audio {
  width: 100%;
  margin-top: 1rem;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1000;
}
.voice-name {
  width: 400px;
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}
.import-file-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: none;
  border-radius: 10px;
  background: #9cc6e2;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
}

.import-file-btn:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}
@media (max-width: 1024px) {
  .tts-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tts-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .control-buttons {
    flex-direction: column;
  }
}
</style>