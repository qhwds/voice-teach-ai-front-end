<template>
  <div class="container">
    <div class="left-section">
      <div class="left-section-top">
        <div class="tts-select">
          <div class="tts-icons" style="display: flex; gap: 10px;">
            <div class="tts-img" @click="startRecording">
              <el-image src="src/assets/stt.png" fit="contain" class="menu-icon2" style="width: 20px;height: 20px"/>
              <div class="tts-text">录音转文字</div>
            </div>
            <div class="tts-img" @click="downloadAudio" disabled="!audioBlob">
              <el-image src="src/assets/load-v.png" fit="contain" class="menu-icon2" style="width: 20px;height: 20px"/>
              <div class="tts-text">下载语音文件</div>
            </div>
            <!-- 悬浮输入框 -->
            <div v-if="isRecording" class="floating-input">
              <el-input
                  type="textarea"
                  v-model="transcribedText"
                  :rows="6"
                  placeholder="录音中，请持续说话..."
                  readonly
              />
              <div class="floating-input-close">
                <el-image
                    v-if="isimg"
                    src="src/assets/停止录音.png"
                    fit="contain"
                    class="isimg"
                    @click="stopRecording"
                />
                <el-image
                    v-else
                    src="src/assets/开始录音.png"
                    fit="contain"
                    class="isimg"
                    @click="startRecording"
                />
                <el-button
                    type="primary"
                    size="small"
                    @click="confirmTranscription"
                    style="margin-left: 10px;"
                >
                  确定
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <hr>
        <div class="text-container">
          <div class="upload-container" >
            <el-upload
                class="upload-demo"
                action="https://jsonplaceholder.typicode.com/posts/"
                multiple
                :limit="10"
                :file-size="50 * 1024 * 1024"
                accept=".word,.pdf,.txt,.excel,.ppt"
                :on-exceed="handleExceed"
                :before-upload="beforeUpload"
                :on-change="handleChange"
                :file-list="fileList"
                drag
            >
              <div  class="load" >
                <p>点击上传或拖入文档</p>
              </div>
            </el-upload>
          </div>
          <div class="textarea-container">
            <textarea v-model="text" placeholder="请输入文本..." rows="10" cols="90" style="border-radius: 10px"></textarea>
            <div class="create-bt">
              <el-image src="src/assets/生成语音文本(蓝).png" fit="contain" class="menu-icon" @click="generateVoice"/>
            </div>
          </div>
        </div>
      </div>
      <div class="voice-sample">
        <label>声音样本</label>
        <div class="voice-card" v-for="voice in voices" :key="voice.name" @click="selectVoice(voice)" :class="{ 'selected': selectedVoice === voice }">
          <img :src="voice.image" alt="Voice Icon" class="voice-icon">
          {{ voice.name }}
          <div class="audio-play" @click.stop="playSample(voice)" style="margin-right: 5px">
            <el-image src="src/assets/tts播放.png" fit="contain" class="tts-image" />
            示例
          </div>
        </div>
      </div>
    </div>
    <div class="right-section">
      <div class="parameter1-select">
        <div class="language-select">
          <label>语言</label>
          <el-select
              v-model="selectedLanguage"
              placeholder="选择语言"
              class="mt-20"
              clearable
          >
            <el-option
                v-for="lang in languages"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
            />
          </el-select>
        </div>
        <div class="scene-select">
          <label>场景</label>
          <el-select
              v-model="selectedScene"
              placeholder="选择场景"
              class="mt-20"
              clearable
          >
            <el-option
                v-for="lang in scene"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
            />
          </el-select>
        </div>
        <div class="format-select">
          <label>格式</label>
          <el-select
              v-model="selectedFormat"
              placeholder="选择音频格式"
              class="mt-20"
              clearable
          >
            <el-option
                v-for="format in audioFormats"
                :key="format.value"
                :label="format.label"
                :value="format.value"
            />
          </el-select>
        </div>
      </div>
      <div class="parameter2-select">
        <div class="language-type-select">
          <label>语音类型</label>
          <el-select
              v-model="selectedVoiceType"
              placeholder="选择语言类型"
              class="mt-20"
              clearable
          >
            <el-option
                v-for="lang in voiceTypes"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
            />
          </el-select>
        </div>
        <div class="style-select">
          <label>语音风格</label>
          <el-select
              v-model="selectedStyle"
              placeholder="选择语音风格"
              class="mt-20"
              clearable
          >
            <el-option
                v-for="lang in style"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
            />
          </el-select>
        </div>
        <div class="role-select">
          <label>角色</label>
          <el-select
              v-model="selectedRole"
              placeholder="选择角色"
              class="mt-20"
              clearable
          >
            <el-option
                v-for="format in role"
                :key="format.value"
                :label="format.label"
                :value="format.value"
            />
          </el-select>
        </div>
      </div>

      <div class="audio-container">
        <Audio/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {ElMessage} from "element-plus";
import Audio from "@/components/Audio.vue";

const text = ref('');
// 语音选择
const selectedLanguage = ref('zh');
const selectedVoice = ref(null);
const languages = ref([
  {value: 'zh', label: '中文'},
  {value: 'en', label: '英文'}
]);
const voices = ref([
  {name: '安柏', image: 'src/assets/img.png'},
  {name: '孙悟空', image: 'src/assets/img.png'},
  {name: '宵宫', image: 'src/assets/img.png'},
  {name: '蜡笔小新', image: 'src/assets/img.png'},
  {name: '四郎', image: 'src/assets/img.png'}
]);
const speechRate = ref(1);
// 选择场景
const selectedScene = ref('1');
const scene = ref([
  {value: '1', label: '场景1'},
  {value: '2', label: '场景2'},
  {value: '3', label: '场景3'},
  {value: '4', label: '场景4'},
  {value: '5', label: '场景5'}
]);
//选择音频格式
const selectedFormat = ref('mp3');
const audioFormats = ref([
  {value: 'mp3', label: 'MP3'},
  {value: 'wav', label: 'WAV'},
  {value: 'ogg', label: 'OGG'}
]);
// 选择语音类型
const selectedVoiceType = ref('young_female');
const voiceTypes = ref([
  { value: 'young_female', label: '年轻女性' },
  { value: 'old_male', label: '老年男性' },
  { value: 'anchor', label: '主播音色' }
]);
// 选择语音风格
const selectedStyle = ref('default');
const style= ref([
  {value: 'default', label: '默认'},
  {value: 'angry', label: '愤怒'},
  {value: 'sad', label: '悲伤'},
  {value: 'happy', label: '快乐'},
  {value: 'excited', label: '兴奋'},
  {value: 'sarcastic', label: '讽刺'},
  {value: 'serious', label: '严肃'},
  {value: 'sweet', label: '甜蜜'},
  {value: 'suspicious', label: '怀疑'},
])
// 选择角色
const selectedRole = ref('default');
const role = ref([
  {value: 'default', label: '默认'},
  {value: 'female', label: '女性'},
  {value: 'male', label: '男性'},
  {value: 'child', label: '儿童'},
  {value: 'teenager', label: '青少年'},
  {value: 'adult', label: '成人'},
  {value: 'senior', label: '老年'},
  {value: 'animal', label: '动物'},
  {value: 'robot',label: '机器人'},
])
const generateVoice = () => {
  console.log('生成语音:', text.value, selectedLanguage.value, selectedVoice.value, speechRate.value);
};

const selectVoice = (voice) => {
  if(selectedVoice.value === voice){
    selectedVoice.value = null;
  }else {
    selectedVoice.value = voice;
  }

};

const playSample = (voice) => {
  console.log('播放样本:', voice.name);
};

//录音相关
const isRecording = ref(false);
const isimg = ref(false);
const transcribedText = ref('');
const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
let recognition;
onMounted(() => {
  if (isSpeechRecognitionSupported) {
    // 初始化 SpeechRecognition 对象
    recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();

    // 设置为连续模式
    recognition.continuous = true;

    // 不返回临时结果
    recognition.interimResults = false;

    // 设置语言为中文
    recognition.lang = 'zh-CN';

    // 处理识别结果
    recognition.onresult = (event) => {
      let transcript = '';
      // 遍历所有最新的识别结果
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      transcribedText.value += transcript.trim() + ' ';
    };

    // 处理识别错误
    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      stopRecording(); // 出现错误时停止录音
    };

    // 处理识别结束
    recognition.onend = () => {
      console.log('语音识别结束');
      // 在连续模式下，不需要手动停止，除非需要
      if (!isRecording.value) {
        isRecording.value = false;
      }
    };
  } else {
    alert('抱歉，您的浏览器不支持语音识别功能。');
  }
});

onUnmounted(() => {
  // 确保在组件卸载时停止识别，防止内存泄漏
  if (recognition && recognition.running) { // 检查是否在运行
    recognition.stop();
  }
});

const startRecording = () => {
  if (!isSpeechRecognitionSupported || !recognition) return;

  recognition.start();
  isRecording.value = true;
  isimg.value = true;
};

const stopRecording = () => {
  if (recognition) {
    recognition.stop();
    isimg.value = false;
  }
};
// 点击确定按钮事件
const confirmTranscription = () => {
  text.value += transcribedText.value;
  transcribedText.value = '';
  isRecording.value = false;
};

// 拖拽相关
const isDragging = ref(false);
// 全局拖拽事件处理
const handleGlobalDragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
  document.body.classList.add('dragging');
};
const handleGlobalDragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;
  document.body.classList.remove('dragging');
};

const handleGlobalDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFiles(files);
  }
};
// 处理文件
const handleFiles = (files) => {
  const reader = new FileReader();
  const file = files[0]; // 只处理第一个文件
  reader.onload = (event) => {
    text.value += event.target.result; // 如果是文本文件
    console.log('文件内容:', text.value);
  };
  reader.readAsText(file); // 如果是其他类型的文件，可以使用 readAsDataURL 或其他方法
  document.body.classList.remove('dragging');
};

onMounted(() => {
  window.addEventListener('dragover', handleGlobalDragOver);
  window.addEventListener('dragleave', handleGlobalDragLeave);
  window.addEventListener('drop', handleGlobalDrop);
});

onUnmounted(() => {
  window.removeEventListener('dragover', handleGlobalDragOver);
  window.removeEventListener('dragleave', handleGlobalDragLeave);
  window.removeEventListener('drop', handleGlobalDrop);
});
// 上传文档
const handleExceed = (files, fileList) => {
  ElMessage.warning(`最多只能上传10个文件，当前已选择${files.length}个文件，共${files.length + fileList.length}个文件`)
}
const beforeUpload = (file) => {
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过50MB!')
    return false
  }
  const isAcceptable = ['application/msword', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)
  if (!isAcceptable) {
    ElMessage.error('只允许上传Word/PDF/TXT/Excel/PPT格式的文件!')
    return false
  }
  return true
}
// 定义fileList数据属性
const fileList = ref([]);
const handleChange = (file, fileList) => {
  fileList.value = fileList;
  const reader = new FileReader();
  reader.onload = (event) => {
    text.value += event.target.result;
  };
  reader.readAsText(file.raw);
};
</script>

<style>
.container {
  display: flex;
  justify-content: space-between;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.left-section {
  width: 50%;
  //border: 2px solid black ;
}

.right-section {
  width: 50%;
  //border: 2px solid black;
}
.parameter1-select{
  display: flex;
  flex-direction: row;
  margin-top: 30px;
}
.language-select,
.scene-select,
.format-select {
  flex: 1; /* 每个子元素占据相等的空间 */
  margin: 0 10px; /* 添加间距 */
}
.parameter2-select{
  display: flex;
  flex-direction: row;
  margin-top: 30px;
}
.language-type-select,
.style-select,
.role-select {
  flex: 1; /* 每个子元素占据相等的空间 */
  margin: 0 10px; /* 添加间距 */
}
.welcome-text h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}
.left-section-top {
  margin: 20px 20px 20px 20px;
  border-radius: 10px;
  background-color: white;
}
.left-section-top:hover{
  border: 2px solid #add8e6;
  border-radius: 10px;
  margin-right: 20px;
}
.left-section-top:focus-within {
  border: 2px solid #add8e6;
  border-radius: 10px;
  margin-right: 20px;
}

.text-container {
  display: flex;
  max-width: 100%;
  flex-direction: row;
  align-items: flex-start;
  border-radius: 10px;
  background-color: white;
}
.text-container textarea {
  width: 90%;
  box-sizing: border-box;
  border: none;
  //outline: none;
  margin-left: 10px;
}

.textarea-container {
  display: flex;
  max-width: 100%;
  margin-top: 20px;
  flex-direction: row;
  align-items: flex-start;
}
.create-bt {
  margin-top: 150px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-container {
  position: relative;
  cursor: pointer;
  border: 2px dashed #add8e6; /* 浅蓝色虚线边框 */
  width: 200px;
  height: 200px;
  margin-top: 20px;
  margin-left: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.voice-sample {
  display: flex;
  margin: 0 20px 0 20px;
  border-radius: 10px;
  flex-direction: column;
  height: 300px;
  overflow-y: auto;
  background-color: white;
  //border: 2px solid black;
}

.voice-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  margin-inline-start: 20px;
  margin-inline-end: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}
.voice-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.voice-card.selected {
  border-color: blue;
}

.voice-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}
.tts-image {
  width: 40px;
  height: 40px;
}

.isimg {

  width: 40px;
  height: 40px;
  margin: 0 0 0 300px;
}

.voice-info button {
  margin-top: 5px;
}

/* 全局拖拽提示 */
body.dragging::after {
  content: '释放文件以上传';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 10px;
  font-size: 18px;
  pointer-events: none;
  z-index: 9999;
}

.tts-select {
  display: flex;
  margin: 10px 10px 0 10px; /* 上 右 下 左 */
  padding: 10px;
}
.tts-img {
  display: flex; /* 使用 Flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 5px; /* 图标和文字之间的间距 */
  cursor: pointer; /* 添加鼠标悬停效果 */
  width: fit-content; /* 根据内容自动调整宽度 */
  height: auto; /* 高度自适应 */
}

.tts-text {
  cursor: pointer; /* 添加鼠标悬停效果 */
}
.tts-text:hover {
  color: #1269b6;
}
.floating-input {
  position: fixed;
  width: 600px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border: 1px solid #cccccc;
  padding: 10px;
  z-index: 1000;
}
.floating-input-close {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.audio-container {
  margin: 20px 0 0 0 ;
}
</style>